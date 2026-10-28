import { useState } from 'react'
import fallbackImage from '../assets/hero.png'

function ImageWithFallback({ src, alt, className = '' }) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(fallbackImage)}
    />
  )
}

export default ImageWithFallback
