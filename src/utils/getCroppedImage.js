export function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#F4F4F4";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));

        // Optional: convert blob to File
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });

        resolve({ blob, file, url: URL.createObjectURL(blob) });
      }, "image/jpeg");
    };

    image.onerror = () => reject(new Error("Failed to load image"));
  });
}
