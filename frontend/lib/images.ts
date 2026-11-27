const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/**
 * For images on Cloudinary (uploaded in the admin panel): asks for the best format the browser supports, automatic
 * quality and at most `width` pixels wide, so large photos aren't sent at full size. Any other address is returned
 * unchanged.
 */
export function optimizedImage(url: string, width: number): string {
  const match = CLOUDINARY_UPLOAD.exec(url);
  return match ? `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}` : url;
}
