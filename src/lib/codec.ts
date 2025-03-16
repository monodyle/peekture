const codec = {
  encode: (data: ArrayBuffer) => {
    const encoder = new TextDecoder('utf-8').decode(data)
    const encodedUri = encodeURIComponent(encoder)
    const encoded = btoa(encodedUri)
    return encoded
  },
  decode: (encodedData: string) => {
    const decoded = atob(encodedData)
    const decodedUri = decodeURIComponent(decoded)
    const data = new TextEncoder().encode(decodedUri)
    return data
  },
}

export default codec
