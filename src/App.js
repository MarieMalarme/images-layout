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

  const layout = useRef()
  const [justification, setJustification] = useState('flex-start')

  const justifications = ['flex-start', 'center', 'flex-end']

  const displayedImages = Object.entries(images).filter(
    ([key, image]) => image.display,
  )

  const removedImages = Object.entries(images).filter(
    ([key, image]) => !image.display && image.url,
  )

  const { length } = displayedImages

  return (
    <Fragment>
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

      <div
        className="layout"
        ref={layout}
        style={{ justifyContent: justification }}
      >
        {displayedImages.map(([key, image], i) => (
          <Image
            images={images}
            setImages={setImages}
            image={image}
            key={key}
            keyName={key}
            color={`hsl(0, 0%, ${((length - i) / length) * 90}%)`}
          />
        ))}
      </div>
      <div
        className="button add-button"
        onClick={() =>
          setImages({
            ...images,
            [`img${totalLength}`]: { url: '', id: totalLength, display: true },
          })
        }
      >
        Add an image
      </div>
      {removedImages.length > 0 && (
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
      )}
    </Fragment>
  )
}

const Image = ({ images, setImages, image, keyName, color, i, ...props }) => {
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
        width: display ? '50%' : '15%',
        height: display ? '200px' : ref.current && ref.current.style.width,
        margin: display ? '0' : `0 ${(i + 1) % 6 === 0 ? '0' : '2%'} 1rem 0`,
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
        <div
          className="put-back-button"
          onClick={() =>
            setImages({ ...images, [keyName]: { ...image, display: true } })
          }
        >
          Put back
        </div>
      )}
    </div>
  )
}

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
