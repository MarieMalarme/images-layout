import React, {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import './App.css'

const App = () => {
  const [images, setImages] = useState({})
  const totalLength = Object.values(images).length

  const layoutRef = useRef()

  const [justification, setJustification] = useState('flex-start')
  const [margins, setMargins] = useState()
  const [borders, setBorders] = useState()

  const displayedImages = Object.entries(images).filter(
    ([key, image]) => image.display,
  )

  const removedImages = Object.entries(images).filter(
    ([key, image]) => !image.display && image.url,
  )

  const { length } = displayedImages

  return (
    <Fragment>
      <LayoutButtons
        length={length}
        margins={margins}
        setMargins={setMargins}
        justification={justification}
        setJustification={setJustification}
        borders={borders}
        setBorders={setBorders}
      />

      <div
        className="layout"
        style={{
          justifyContent: justification,
          border: length ? `solid 1px hsl(0, 0%, 92%)` : 'none',
        }}
        ref={layoutRef}
      >
        {displayedImages.map(([key, image], i) => (
          <Image
            images={images}
            setImages={setImages}
            image={image}
            key={key}
            keyName={key}
            color={`hsl(0, 0%, ${((length - i) / length) * 90}%)`}
            length={length}
            margins={margins}
            borders={borders}
            i={i}
          />
        ))}
      </div>

      <AddButton
        length={length}
        onClick={() =>
          setImages({
            ...images,
            [`img${totalLength}`]: {
              url: '',
              id: totalLength,
              display: true,
            },
          })
        }
      />

      {removedImages.length > 0 && (
        <RemovedImages
          removedImages={removedImages}
          images={images}
          setImages={setImages}
          layoutRef={layoutRef}
        />
      )}
    </Fragment>
  )
}

const LayoutButtons = ({
  length,
  margins,
  setMargins,
  justification,
  setJustification,
  borders,
  setBorders,
}) => (
  <div
    className="layout-buttons"
    style={{
      opacity: length ? '1' : '0.25',
    }}
  >
    <LayoutButton
      length={length}
      state={margins}
      setState={setMargins}
      text="Margins"
      toggle
    />
    <Justification
      justification={justification}
      setJustification={setJustification}
      length={length}
    />
    <LayoutButton
      length={length}
      state={borders}
      setState={setBorders}
      text="Border"
      toggle
    />
  </div>
)

const LayoutButton = ({ state, setState, length, text, toggle, value }) => {
  const isSelected = toggle ? state : state === value
  return (
    <div
      style={{
        background: isSelected ? '#fbd052' : 'grey',
        cursor: length ? 'pointer' : 'default',
        width: toggle ? '15%' : '30%',
      }}
      className="button hover-button"
      onClick={() => length && setState(toggle ? !state : value)}
    >
      {text}
    </div>
  )
}

const Justification = ({ justification, setJustification, length }) => {
  const justifications = ['flex-start', 'center', 'flex-end']

  return (
    <div className="justify-buttons">
      {justifications.map(value => (
        <LayoutButton
          length={length}
          state={justification}
          setState={setJustification}
          value={value}
          text={
            (value === 'flex-start' && 'Left align') ||
            (value === 'flex-end' && 'Right align') ||
            'Center'
          }
          key={value}
        />
      ))}
    </div>
  )
}

const Image = ({
  images,
  setImages,
  image,
  keyName,
  color,
  length,
  layoutRef,
  margins,
  borders,
  i,
  ...props
}) => {
  const [hasMouseDown, setHasMouseDown] = useState(false)
  const ref = useRef()

  const resize = useCallback(
    e => {
      if (hasMouseDown.right) {
        ref.current.style.width = e.pageX - ref.current.offsetLeft + 5 + 'px'
      }
      if (hasMouseDown.down) {
        ref.current.style.height = e.pageY - ref.current.offsetTop + 5 + 'px'
      }
    },
    [hasMouseDown.right, hasMouseDown.down],
  )

  useEffect(() => {
    if (hasMouseDown) {
      window.addEventListener('mousemove', resize)
      window.addEventListener('mouseup', () => setHasMouseDown(false))
    }
    return () => {
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', () => setHasMouseDown(false))
    }
  }, [hasMouseDown, resize])

  const { url, display } = image

  const oddLength = length % 2
  const isOdd = (i + 1) % 2
  const isLast = i + 1 === length

  const sixMultiple = (i + 1) % 6 === 0

  const displayWidth =
    (oddLength && isOdd && isLast && '100%') ||
    (margins && 'calc(50% - 0.7rem)') ||
    '50%'
  const displayMargin = margins ? '0.35rem' : 0

  const removedHeight =
    !display && (15 / 100) * layoutRef.current.getBoundingClientRect().width

  return (
    <div
      className={`image ${display ? 'displayed' : 'removed'}`}
      ref={ref}
      style={{
        background: `center / cover no-repeat ${
          display
            ? `url(${url}), ${color}`
            : `linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${url})`
        }`,
        width: display ? displayWidth : '15%',
        height: display ? '300px' : removedHeight,
        margin: display
          ? displayMargin
          : `0 ${sixMultiple ? '0' : '2%'} 1rem 0`,
        border: borders ? 'solid 1px hsl(0, 0%, 40%)' : 'none',
      }}
      {...props}
    >
      {display ? (
        <Controllers
          setImages={setImages}
          images={images}
          keyName={keyName}
          image={image}
          setHasMouseDown={setHasMouseDown}
          imgRef={ref}
        />
      ) : (
        <PutBackButton
          onClick={() =>
            setImages({ ...images, [keyName]: { ...image, display: true } })
          }
        />
      )}
    </div>
  )
}

const positions = ['right', 'corner', 'down']

const Controllers = ({
  images,
  setImages,
  image,
  keyName,
  setHasMouseDown,
  imgRef,
}) => (
  <Fragment>
    <RemoveButton
      action={() => {
        setImages({ ...images, [keyName]: { ...image, display: false } })
      }}
    />

    <Icon
      up
      imgRef={imgRef}
      action={() => {
        imgRef.current.style.alignSelf = 'flex-start'
      }}
    />

    <UrlInput
      onChange={e => {
        setImages({
          ...images,
          [keyName]: { ...image, url: e.target.value },
        })
      }}
      value={image.url}
    />

    <Icon
      down
      imgRef={imgRef}
      action={() => {
        imgRef.current.style.alignSelf = 'flex-end'
      }}
    />

    {positions.map(position => (
      <Handler
        position={position}
        setHasMouseDown={setHasMouseDown}
        key={position}
      />
    ))}
  </Fragment>
)

const AddButton = ({ length, ...props }) => (
  <div
    style={{
      height: length === 0 ? '302px' : '60px',
      marginTop: length ? '40px' : 0,
    }}
    className="button add-button"
    {...props}
  >
    + Add a new image
  </div>
)

const RemoveButton = ({ action }) => (
  <div className="remove-button">
    <Icon close action={action} />
  </div>
)

const PutBackButton = props => (
  <div className="put-back-button" {...props}>
    Put back
  </div>
)

const UrlInput = props => (
  <input type="text" placeholder="Paste the Image URL" {...props} />
)

const Icon = ({ up, down, close, action }) => (
  <svg onClick={action} width="40px" viewBox="0 0 130 130">
    <path
      fill="none"
      stroke="white"
      strokeWidth={6}
      d={
        (up && 'M17.35 55.4L65 7.75l47.65 47.65M65 122.75V8.41') ||
        (down && 'M114.65 73.1L67 120.75 19.35 73.1M67 5.75v114.34') ||
        (close && 'M24 24l82 82M106 24l-82 82')
      }
    />
  </svg>
)

const Handler = ({ position, setHasMouseDown }) => (
  <div
    className={`handler handler-${position}`}
    onMouseDown={() => {
      setHasMouseDown({
        right: position === 'right' || position === 'corner',
        down: position === 'down' || position === 'corner',
      })
    }}
  >
    {[...Array(3)].map((e, i) => (
      <div className={`handler-item-${position}`} key={`${position}-${i}`} />
    ))}
  </div>
)

const RemovedImages = ({ removedImages, images, setImages, layoutRef }) => (
  <div className="removed-block">
    Removed images
    <div className="removed-images">
      {removedImages.map(([key, image], i) => (
        <Image
          key={key}
          image={image}
          images={images}
          setImages={setImages}
          keyName={key}
          layoutRef={layoutRef}
          i={i}
        />
      ))}
    </div>
  </div>
)

export default App
