import axios from "axios"
import userModel from "../models/userModel.js"


async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/nebius/v1/images/generations",
		{
			headers: {
				Authorization: `Bearer ${process.env.HF_API_KEY}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
	return result;
}





export const generateImage = async (req, res) => {
    try {
        const { userId, prompt } = req.body
        let imageUrl = ''
        const user = await userModel.findById(userId)

        if (!user || !prompt) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        if (user.creditBalance === 0 || user.creditBalance < 0) {
            return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance })
        }

        // SIMPLE LOCAL IMPLEMENTATION (no external Hugging Face call)
        // This removes the source of HTTP 410 completely.
        // let blob='';
//         const resultImage =  query({response_format: "b64_json",
//     prompt: `\"${prompt}\"`,
//     model: "black-forest-labs/flux-dev", }).then((response) => {
//         // const reader = new FileReader();
//         // reader.readAsDataURL(response);
//         // console.log("----------- ", response);
//          blob = response; 
    

// // console.log(blob);

// });


 const resp = await query({
      response_format: "b64_json",
      prompt: `"${prompt}"`,
      model: "black-forest-labs/flux-dev",
    });
console.log("--------------- ", resp);







 let parsed;
    if (resp instanceof Blob) {
      // resp.type === "application/json" in your case
      const txt = await resp.text();           // <-- this works because resp is a Blob
      try {
        parsed = JSON.parse(txt);
      } catch (e) {
        console.error("Failed to parse JSON from blob text:", e, txt);
        throw e;
      }
    } else if (typeof resp?.json === "function") {
      // some libs return a fetch Response
      parsed = await resp.json();
    } else {
      // most likely already a plain JS object
      parsed = resp;
    }

    console.log("parsed response:", parsed);



     const b64 =
      parsed?.b64_json ??
      parsed?.data?.[0]?.b64_json ??
      parsed?.images?.[0]?.b64 ??
      // if the model returned a data URI like "data:image/png;base64,AAA..."
      (typeof parsed === "string" ? extractBase64FromPossibleDataUri(parsed) : null) ??
      deepFindBase64(parsed);

    if (!b64) {
      // helpful debug guidance
      console.error("No base64 found. Parsed top-level keys:", Object.keys(parsed || {}));
      throw new Error("No base64 image found in response");
    }

    // convert base64 -> binary blob
    // const b64 = parsed?.data?.[0]?.b64_json;
    // const mime = "image/webp";
    const mime = (() => {
  // hint: parsed result often indicates WebP (UklGR) — adjust if you detect PNG/JPEG
  if (b64.startsWith("UklGR") || parsed?.data?.[0]?.mime === "image/webp") return "image/webp";
  // fallback
  return "image/png";
})();

// const dataUri = `data:${mime};base64,${b64}`;
    const imgBlob = base64ToBlob(b64, "image/png"); // or infer type if data URI present
    const url = URL.createObjectURL(imgBlob);
    const dataUri = `data:${mime};base64,${b64}`;












//  const b64 =
//       resp.b64_json ?? // e.g. { b64_json: "..." }
//       (resp.data && resp.data[0] && resp.data[0].b64_json) ?? // e.g. { data:[{b64_json: "..."}] }
//       null;

//     if (!b64) throw new Error("No base64 image found in response");

//     // decode base64 to binary
//     const binary = atob(b64);
//     const len = binary.length;
//     const bytes = new Uint8Array(len);
//     for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

//     // create a Blob and an object URL to show the image
//     const blob = new Blob([bytes.buffer], { type: "image/png" }); // or image/jpeg
//     const url = URL.createObjectURL(blob);



console.log("****************** ",dataUri);

// 3. Create the source URL
// Note: The "UklGR" start indicates it is a WebP image
//  imageUrl = `data:image/webp;base64,${base64String}`;
//  console.log("------------------- ", imageUrl);
        const newBalance = user.creditBalance - 1
        await userModel.findByIdAndUpdate(user._id, { creditBalance: newBalance })

    //  console.log("-------------------- ", resultImage);
     
        return res.json({
            success: true,
            message: 'Image Generated',
            creditBalance: newBalance,
            dataUri,
        })
    } catch (error) {
        console.error('Image generation error:', error.message)

        // Never propagate low-level HTTP errors or status texts to the client.
        return res.json({
            success: false,
            message: 'Failed to generate image. Please try again later.',
        })
    }
}


function extractBase64FromPossibleDataUri(s) {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/);
  if (m) return m[2]; // return only b64 part
  // also allow long raw b64 strings
  if (s.length > 100 && /^[A-Za-z0-9+/=\s]+$/.test(s)) return s.replace(/\s+/g, "");
  return null;
}

function deepFindBase64(obj) {
  // simple shallow checks — extend if needed
  if (!obj || typeof obj !== "object") return null;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "string") {
      const b = extractBase64FromPossibleDataUri(v);
      if (b) return b;
    } else if (Array.isArray(v) && v[0] && typeof v[0] === "object") {
      const candidate = v[0].b64_json || v[0].b64 || v[0].content;
      if (candidate) {
        const b = extractBase64FromPossibleDataUri(candidate);
        if (b) return b;
      }
    } else if (typeof v === "object") {
      // one-level deep recursion
      const nested = deepFindBase64(v);
      if (nested) return nested;
    }
  }
  return null;
}

function base64ToBlob(base64, mime) {
  // clean whitespace
  const b64 = base64.replace(/\s+/g, "");
  const binary = atob(b64);
  const len = binary.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr.buffer], { type: mime || "image/png" });
}
