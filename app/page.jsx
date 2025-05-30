// pages/index.js
"use client";

import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ImageCustomizer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [selectedFormat, setSelectedFormat] = useState("profile");
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState("jpg");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [customWidth, setCustomWidth] = useState(500);
  const [customHeight, setCustomHeight] = useState(500);
  const [showCustom, setShowCustom] = useState(true);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const downloadRef = useRef(null);
  const containerRef = useRef(null);

  const socialMediaFormats = {
    facebook: {
      profile: { width: 180, height: 180, label: "Profile Picture" },
      cover: { width: 820, height: 312, label: "Cover Photo" },
      post: { width: 1200, height: 630, label: "Post Image" },
      story: { width: 1080, height: 1920, label: "Story" },
    },
    instagram: {
      profile: { width: 320, height: 320, label: "Profile Picture" },
      post: { width: 1080, height: 1080, label: "Square Post" },
      landscape: { width: 1080, height: 566, label: "Landscape Post" },
      story: { width: 1080, height: 1920, label: "Story" },
      reel: { width: 1080, height: 1920, label: "Reel" },
    },
    twitter: {
      profile: { width: 400, height: 400, label: "Profile Picture" },
      header: { width: 1500, height: 500, label: "Header" },
      post: { width: 1200, height: 675, label: "Post Image" },
    },
    linkedin: {
      profile: { width: 400, height: 400, label: "Profile Picture" },
      cover: { width: 1584, height: 396, label: "Cover Photo" },
      post: { width: 1200, height: 627, label: "Post Image" },
    },
    tiktok: {
      profile: { width: 200, height: 200, label: "Profile Picture" },
      video: { width: 1080, height: 1920, label: "Video Cover" },
    },
    youtube: {
      profile: { width: 800, height: 800, label: "Profile Picture" },
      thumbnail: { width: 1280, height: 720, label: "Video Thumbnail" },
      cover: { width: 2560, height: 1440, label: "Channel Cover" },
    },
    email: {
      header: { width: 600, height: 400, label: "Email Header" },
      banner: { width: 600, height: 200, label: "Email Banner" },
    },
    website: {
      banner: { width: 1000, height: 500, label: "Website Banner" },
      square: { width: 500, height: 500, label: "Square Image" },
      hero: { width: 1920, height: 1080, label: "Hero Image" },
    },
  };

  const downloadFormats = [
    { id: "jpg", name: "JPG", color: "from-blue-600 to-cyan-500" },
    { id: "png", name: "PNG", color: "from-purple-600 to-pink-500" },
    { id: "webp", name: "WEBP", color: "from-green-600 to-emerald-500" },
    { id: "gif", name: "GIF", color: "from-yellow-600 to-amber-500" },
    { id: "bmp", name: "BMP", color: "from-red-600 to-orange-500" },
    { id: "tiff", name: "TIFF", color: "from-indigo-600 to-violet-500" },
  ];

  const notify = (message, type = "success") => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  useEffect(() => {
    document.title = "Image Format Customizer";

    // Create floating shapes background
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing shapes
    const existingShapes = container.querySelectorAll(".floating-shape");
    existingShapes.forEach((shape) => shape.remove());

    // Create new shapes
    for (let i = 0; i < 20; i++) {
      const shape = document.createElement("div");
      shape.className = "floating-shape";

      // Random position
      const left = Math.random() * 100;
      const top = Math.random() * 100;

      // Random size
      const size = Math.random() * 60 + 20;

      // Random shape
      const isCircle = Math.random() > 0.5;

      // Random color
      const colors = [
        "rgba(92, 107, 192, 0.3)",
        "rgba(106, 27, 154, 0.3)",
        "rgba(56, 142, 60, 0.3)",
        "rgba(245, 124, 0, 0.3)",
        "rgba(211, 47, 47, 0.3)",
        "rgba(2, 119, 189, 0.3)",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      shape.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: ${top}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "4px"};
        animation: float ${Math.random() * 20 + 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
        opacity: ${Math.random() * 0.5 + 0.2};
        z-index: 0;
      `;

      container.appendChild(shape);
    }

    return () => {
      // Clean up shapes when component unmounts
      const shapes = container.querySelectorAll(".floating-shape");
      shapes.forEach((shape) => shape.remove());
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      return notify(
        "Please select a valid image file (JPG, PNG, WEBP).",
        "error"
      );
    }

    handleFile(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
  };

  const handleFile = (file) => {
    setSelectedFile(file);

    try {
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
    } catch (error) {
      console.error("Error in file processing:", error);
      notify(`Error loading image: ${error.message}`, "error");
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      let width, height;

      if (showCustom) {
        width = customWidth;
        height = customHeight;
      } else {
        const size = socialMediaFormats[selectedPlatform][selectedFormat];
        width = size.width;
        height = size.height;
      }

      canvas.width = width;
      canvas.height = height;

      // Calculate aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      let renderableWidth, renderableHeight;
      let xStart, yStart;

      // If image is wider than canvas
      if (imgAspect > canvasAspect) {
        renderableHeight = height;
        renderableWidth = img.width * (renderableHeight / img.height);
        xStart = (width - renderableWidth) / 2;
        yStart = 0;
      }
      // If image is taller than canvas
      else {
        renderableWidth = width;
        renderableHeight = img.height * (renderableWidth / img.width);
        xStart = 0;
        yStart = (height - renderableHeight) / 2;
      }

      // Draw image centered and cropped
      ctx.drawImage(img, xStart, yStart, renderableWidth, renderableHeight);

      // Create download link
      let mimeType, extension;

      switch (selectedDownloadFormat) {
        case "jpg":
          mimeType = "image/jpeg";
          extension = "jpg";
          break;
        case "png":
          mimeType = "image/png";
          extension = "png";
          break;
        case "webp":
          mimeType = "image/webp";
          extension = "webp";
          break;
        case "gif":
          mimeType = "image/gif";
          extension = "gif";
          break;
        case "bmp":
          mimeType = "image/bmp";
          extension = "bmp";
          break;
        case "tiff":
          // Note: Most browsers don't support TIFF in canvas
          mimeType = "image/tiff";
          extension = "tiff";
          break;
        default:
          mimeType = "image/jpeg";
          extension = "jpg";
      }

      try {
        const dataURL = canvas.toDataURL(mimeType);
        downloadRef.current.href = dataURL;

        // Set filename
        let filename = "custom-image";
        if (!showCustom) {
          filename = `${selectedPlatform}-${selectedFormat}`;
        }
        downloadRef.current.download = `${filename}.${extension}`;

        // Trigger download
        downloadRef.current.click();
        notify(`Image downloaded as ${extension.toUpperCase()}!`);
      } catch (e) {
        notify(
          `Error downloading ${extension.toUpperCase()} format: ${e.message}`,
          "error"
        );
      }
    };

    img.src = imageUrl;
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSuggestions = Object.entries(socialMediaFormats).map(
    ([platform, formats]) => (
      <div key={platform} className="bg-white/5 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3 capitalize">
          {platform}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(formats).map(([format, size]) => (
            <div
              key={format}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedPlatform === platform && selectedFormat === format
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              onClick={() => {
                setSelectedPlatform(platform);
                setSelectedFormat(format);
                setShowCustom(true);
              }}
            >
              <div className="text-sm font-medium text-white">{size.label}</div>
              <div className="text-xs text-white/80">
                {size.width}×{size.height}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4 md:p-8 relative overflow-hidden"
    >
      {/* Floating shapes background */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
          }
          100% {
            transform: translateY(-100px) rotate(720deg);
          }
        }

        .floating-shape {
          position: absolute;
          animation: float linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center py-8 md:py-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-300">
            Social Media Image Customizer
          </h1>
          <p className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto">
            Optimize your images for any platform with perfect dimensions and
            download formats
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Controls */}
          <div className="lg:col-span-1 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-xl p-6">
            <h2 className="text-2xl font-bold text-cyan-200 mb-6">
              Upload & Customize
            </h2>

            {/* Upload Area */}
            <div
              className={`w-full h-48 rounded-xl border-3 border-dashed flex flex-col items-center justify-center transition-all duration-300 cursor-pointer mb-6 ${
                isDragging
                  ? "bg-blue-900/40 border-cyan-400"
                  : "bg-purple-900/30 border-purple-500 hover:border-cyan-400"
              }`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-3 rounded-full mb-3 inline-block">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-purple-300 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">
                    Click to change
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-3 rounded-full mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-white">
                    {isDragging
                      ? "Drop your image here"
                      : "Click or drag to upload"}
                  </p>
                  <p className="text-xs text-purple-300 mt-2">
                    Supports JPG, PNG, WEBP
                  </p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-cyan-200">Image Details</h3>
                  <button
                    onClick={handleDeleteFile}
                    className="text-purple-300 hover:text-white text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div className="bg-purple-900/40 p-2 rounded">
                    <div className="text-purple-400">Dimensions</div>
                    <div className="text-white">
                      {dimensions.width}×{dimensions.height} px
                    </div>
                  </div>
                  <div className="bg-purple-900/40 p-2 rounded">
                    <div className="text-purple-400">Size</div>
                    <div className="text-white">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Size Toggle */}
            <div className="mb-6">
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  showCustom ? "bg-cyan-900/30" : "bg-purple-900/30"
                }`}
                onClick={() => setShowCustom(!showCustom)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full mr-3 ${
                      showCustom ? "bg-cyan-500" : "bg-purple-700"
                    }`}
                  ></div>
                  <span className="font-medium">Custom Dimensions</span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    showCustom
                      ? "bg-cyan-700 text-white"
                      : "bg-purple-700 text-purple-300"
                  }`}
                >
                  {showCustom ? "ON" : "OFF"}
                </span>
              </div>

              {showCustom && (
                <div className="mt-4 bg-purple-900/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={customWidth}
                        onChange={(e) =>
                          setCustomWidth(parseInt(e.target.value) || 100)
                        }
                        className="w-full bg-purple-900/50 border border-purple-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="5000"
                        value={customHeight}
                        onChange={(e) =>
                          setCustomHeight(parseInt(e.target.value) || 100)
                        }
                        className="w-full bg-purple-900/50 border border-purple-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-purple-400 mb-4">
                    Aspect ratio: {(customWidth / customHeight).toFixed(2)}:1
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={downloadImage}
              disabled={!selectedFile || isLoading}
              className={`w-full py-3 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center ${
                !selectedFile || isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 hover:shadow-cyan-500/30"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Image
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Preview & Format Selection */}
          <div className="lg:col-span-2">
            {/* Preview Section */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-200">
                  Image Preview
                </h2>
                {selectedFile && (
                  <div className="text-sm bg-purple-900/50 px-3 py-1 rounded-full">
                    {showCustom ? (
                      <span>
                        {customWidth}×{customHeight} px
                      </span>
                    ) : (
                      <span className="capitalize">
                        {selectedPlatform} {selectedFormat} (
                        {
                          socialMediaFormats[selectedPlatform][selectedFormat]
                            .width
                        }
                        ×
                        {
                          socialMediaFormats[selectedPlatform][selectedFormat]
                            .height
                        }
                        )
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center mb-8">
                {imageUrl ? (
                  <div className="relative w-full max-w-4xl">
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl overflow-hidden shadow-xl border border-purple-500/20">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full max-h-[60vh] object-contain mx-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-purple-900/20 rounded-xl border-2 border-dashed border-purple-500/30">
                    <p className="text-purple-400">
                      Upload an image to see preview
                    </p>
                  </div>
                )}
              </div>

              {/* Format Selection BELOW the image */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-cyan-200 mb-4 text-center">
                  Select Download Format
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {downloadFormats.map((format) => (
                    <button
                      key={format.id}
                      className={`py-3 rounded-xl font-medium shadow-lg transition-all ${
                        selectedDownloadFormat === format.id
                          ? "bg-gradient-to-r from-cyan-600 to-blue-500 transform scale-105"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      onClick={() => setSelectedDownloadFormat(format.id)}
                    >
                      {format.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-purple-300">
                    Selected:{" "}
                    <span className="font-bold text-cyan-300">
                      {selectedDownloadFormat.toUpperCase()}
                    </span>{" "}
                    -{" "}
                    {selectedDownloadFormat === "jpg"
                      ? "Best for photos"
                      : selectedDownloadFormat === "png"
                      ? "Supports transparency"
                      : selectedDownloadFormat === "webp"
                      ? "Modern efficient format"
                      : selectedDownloadFormat === "gif"
                      ? "Supports animation"
                      : selectedDownloadFormat === "bmp"
                      ? "Uncompressed format"
                      : "High quality printing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Suggestions */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">
                Social Media Formats
              </h2>

              <div className="space-y-6">{formatSuggestions}</div>

              <div className="mt-8 text-center text-sm text-purple-300">
                <p>Select a format above or create custom dimensions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden canvas and download link */}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <a ref={downloadRef} className="hidden"></a>

        {/* Footer */}
        <footer className="mt-12 text-center text-purple-300 py-6 border-t border-purple-500/30">
          <p>© 2023 Social Media Image Customizer. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Create perfectly sized images for any platform
          </p>
        </footer>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <style jsx global>{`
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
            sans-serif;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          min-height: 100vh;
          margin: 0;
          color: white;
        }

        .Toastify__toast-container {
          z-index: 9999;
        }

        .Toastify__toast {
          background: rgba(40, 30, 80, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(125, 95, 255, 0.3);
          border-radius: 12px;
          color: white;
        }

        .Toastify__progress-bar {
          background: linear-gradient(to right, #7d5fff, #5ce1e6);
        }

        .Toastify__close-button {
          color: #a78bfa;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
