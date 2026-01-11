import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import { Button } from "@mui/material";
import { getCroppedImg } from "../../utils/getCroppedImage";


export default function ImageCropper(Props) {
  const { imageSrc, onCropComplete, setImageSrc } = Props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    const { file } = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropComplete(file);
    setImageSrc(null);
  };

  return (
    <div>
      <div style={{ position: "relative", width: "100%", height: 300 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e, zoom) => setZoom(zoom)}
        />
        <Button variant="contained" color="primary" onClick={handleDone}>
          Crop
        </Button>
      </div>
    </div>
  );
}
