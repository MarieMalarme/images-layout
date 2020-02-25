import React, {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import './App.css'

const Justification = ({ justification, setJustification, length }) => {
  const justifications = ['flex-start', 'center', 'flex-end']

  return (
    <div
      className="justify-buttons"
      style={{
        opacity: length ? '1' : '0.25',
      }}
    >
      {justifications.map(value => (
        <div
          style={{
            background: justification === value ? '#fbd052' : 'grey',
            cursor: length ? 'pointer' : 'default',
          }}
          className="button justify-button"
          key={value}
          onClick={() => {
            length && setJustification(value)
          }}
        >
          {(value === 'flex-start' && 'Left align') ||
            (value === 'flex-end' && 'Right align') ||
            'Center'}
        </div>
      ))}
    </div>
  )
}

const App = () => {
  const [images, setImages] = useState({})
  const totalLength = Object.values(images).length

  const [justification, setJustification] = useState('flex-start')

  const displayedImages = Object.entries(images).filter(
    ([key, image]) => image.display,
  )

  const removedImages = Object.entries(images).filter(
    ([key, image]) => !image.display && image.url,
  )

  const { length } = displayedImages

  return (
    <Fragment>
      <Justification
        justification={justification}
        setJustification={setJustification}
        length={length}
      />

      <div
        className="layout"
        style={{
          justifyContent: justification,
          border: length ? `solid 1px hsl(0, 0%, 92%)` : 'none',
        }}
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
        />
      )}
    </Fragment>
  )
}

const RemovedImages = ({ removedImages, images, setImages }) => (
  <div className="removed-block">
    Removed images
    <div className="removed">
      {removedImages.map(([key, image], i) => (
        <Image
          key={key}
          image={image}
          images={images}
          setImages={setImages}
          keyName={key}
          i={i}
        />
      ))}
    </div>
  </div>
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

const Image = ({
  images,
  setImages,
  image,
  keyName,
  color,
  length,
  i,
  ...props
}) => {
  const [hasMouseDown, setHasMouseDown] = useState(false)
  const ref = useRef()

  const resize = useCallback(e => {
    ref.current.style.width = e.pageX - ref.current.offsetLeft + 5 + 'px'
    ref.current.style.height = e.pageY - ref.current.offsetTop + 5 + 'px'
  }, [])

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

  const displayWidth = oddLength && isOdd && isLast ? '100%' : '50%'

  return (
    <div
      className="image"
      ref={ref}
      style={{
        background: `center / cover no-repeat ${
          display
            ? `url(${url}), ${color}`
            : `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${url})`
        }`,
        width: display ? displayWidth : '15%',
        height: display ? '200px' : ref.current && ref.current.style.width,
        margin: display ? '0' : `0 ${sixMultiple ? '0' : '2%'} 1rem 0`,
        flexDirection: display ? 'column' : 'row',
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

const PutBackButton = props => (
  <div className="put-back-button" {...props}>
    Put back
  </div>
)

const Controllers = ({
  images,
  setImages,
  image,
  keyName,
  setHasMouseDown,
  imgRef,
}) => (
  <Fragment>
    <RemoveImage
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

    <div
      className="handler"
      onMouseDown={() => {
        setHasMouseDown(true)
      }}
    />
  </Fragment>
)

const RemoveImage = ({ action }) => (
  <div className="remove-button">
    <Icon close action={action} />
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

export default App
