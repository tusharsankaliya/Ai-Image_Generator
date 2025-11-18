import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const { generateImage } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (input) {
      const generatedImage = await generateImage(input);
      // Always show some image, even if generation failed
      const safeImage = generatedImage || assets.sample_img_2;
      setIsImageLoaded(true);
      setImage(safeImage);
    }

    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center justify-center min-h-[90vh]"
    >
      <div>
        <div className="relative">
          {/* Dynamically change image */}
          <img src={image} alt="Generated" className="max-w-sm rounded ring-1 ring-white/10 shadow-lg" />
          <span
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 ${
              loading ? 'w-full transition-all duration-[10s]' : 'w-0'
            }`}
          />
        </div>
        <p className={!loading ? 'hidden' : 'text-slate-300 mt-2'}>Loading...</p>
      </div>

      {!isImageLoaded && (
        <div className="flex w-full max-w-xl bg-white/10 border border-white/10 backdrop-blur text-sm p-1 mt-10 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Describe what you want to generate"
            className="flex-1 bg-transparent outline-none ml-6 max-sm:w-20 placeholder-color text-slate-100"
          />
          <button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-8 sm:px-14 py-3 rounded-full text-white shadow-md hover:shadow-fuchsia-500/20 hover:scale-[1.02] transition">
            Generate 1
          </button>
        </div>
      )}

      {isImageLoaded && (
        <div className="flex gap-2 flex-wrap mt-10 justify-center text-white text-sm p-0.5 rounded-full">
          {/* Reset image to default when clicking "Generate Another" */}
          <p
            onClick={() => {
              setIsImageLoaded(false);
              setImage(assets.sample_img_1); // Reset to default image
            }}
            className="bg-transparent border border-white/20 text-slate-200 px-8 py-3 rounded-full cursor-pointer hover:bg-white/10"
          >
            Generate Another
          </p>
          <a href={image} download className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-10 py-3 rounded-full cursor-pointer shadow-md hover:shadow-fuchsia-500/20 hover:scale-[1.02] transition">
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Result;
