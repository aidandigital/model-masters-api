import React, { useState, useEffect } from 'react';
import { XIcon } from "@heroicons/react/solid";
import { PhotographIcon } from "@heroicons/react/outline";
import TinyLoader from "./TinyLoader";
import Note from '../parts/Note';
import heic2any from "heic2any";

// Known Bugs: Trying to add the same image twice in a row will do nothing because there is no change detected in the file input (onChange). However, this bug works in our favor
// File types Supported: JPEG, JPG, PNG, HEIC, GIF
// File conversions Supported: HEIC. Will convert to a new JPEG file that can be read as a JPEG and successfully checked for extension and mimetype (as a JPEG) in backend.

const ImagesInput = (props) => {
    const [images, setImages] = useState([...props.value]);
    const [addingImageNow, setAddingImageNow] = useState(false);

    function getFileNameBody(fileName) {
        let fileNameBody = fileName.split(".");
        fileNameBody.pop();
        return fileNameBody;
    }

    function convertAwayFromHeic(image) {
        var fileName = image.name;
        var fileNameBody = getFileNameBody(fileName)
        var fileNameExt = fileName.substr(fileName.lastIndexOf('.') + 1);
        return new Promise((resolve, reject) => {
            if (fileNameExt == "heic") {
                var blob = image;
                heic2any({
                    blob: blob,
                    toType: "image/jpeg", // JPEG takes less bytes than PNG
                }).then((resultBlob) => {
                    // Convert our new blob to a file so can be handled by backend properly
                    let resultFile = new File([resultBlob], fileNameBody + ".jpeg", {type: "image/jpeg"})
                    // ^ "type" attribute is important for verifying mimetype in backend
                    if (resultFile) {
                        // Alles in butter!
                        resolve(resultFile);
                    } else {
                        // Error: couldn't convert result blob to file
                        reject(null)
                    }
                }).catch((err) => {
                    // Error converting image
                    reject(null);
                })
            } else {
                resolve(image);
            }
        })
    }

    async function imageInputChange(e) {
        // Prevent adding "undefined" to images array after user clicks cancel in some cases
        if (e.target.files[0]) {
            // Set loading to true essentially
            setAddingImageNow(true);
            // Try checking/converting image
            try {
                let newImage = await convertAwayFromHeic(e.target.files[0])
                if (newImage) {
                    // Add the image if check/conversion worked, otherwise throw new error
                    setImages([...images, newImage])
                } else {
                    throw "no image after check/conversion";
                }
            } catch {
                alert("Failed to add image.")
            }
            setAddingImageNow(false);
        }
    }

    function deleteImage(index) {
        setImages((oldImages) => oldImages.filter((data, i) => i !== index));
    }

    function getImagePreviewURL(image) {
        return URL.createObjectURL(image)
    }

    // Update parent form state once local images state has updated
    useEffect(() => {
        props.customStateSetter(images);
    }, [images])

    return (
        <div className="my-3">
            <div className={`border rounded-md px-5 py-2 w-full placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark ` + (props.error ? "ring-thirdlydark ring-1 border-opacity-0" : null)}>
                <div>
                    {/* Real file upload is hidden, controlled by styled label element */}
                    <label for="imageInput">
                        {/* Custom button to prevent wierd form reload behavior and have custom sized icon */}
                        <div className={"bg-secondarylight px-3 py-1 pb-1.5 md:px-3.5 md:py-1.5 md:pb-2 my-1.5 rounded-lg duration-150 w-max cursor-" + ((props.maxImages === images.length || addingImageNow) ? "not-allowed opacity-60" : "pointer hover:bg-opacity-70")}>
                            <PhotographIcon className="h-5 inline-block mr-1.5 relative -top-0.5" />
                            <div className="inline-block">Add Photo</div>
                        </div>
                    </label>
                    <input id="imageInput" className="hidden" type="file" accept=".jpeg, .jpg, .png, .heic, .gif" /* << This is important, don't change! Make sure to validate on back end too though! */ onChange={imageInputChange} disabled={props.maxImages === images.length || addingImageNow ? "disabled" : false} />
                </div>
                {images.map((image, i) => (
                    <div key={i} className="inline-block text-black p-2 my-2 mr-3 rounded-md border w-max">
                        <img alt={image.name} src={getImagePreviewURL(image)} className="inline-block w-20 h-20 object-cover object-center" />
                        <span className="inline-block" onClick={() => deleteImage(i)}>
                            <XIcon className="h-5 inline-block cursor-pointer ml-2 relative -top-0.5" />
                        </span>
                    </div>
                ))}
                {addingImageNow ? (
                    <div className="pt-3">
                        <div className="inline-block">
                            <TinyLoader color="thirdlybackground" />
                        </div>
                        <div className="inline-block relative -top-3 left-2">
                            <Note>Converting image to proper format, this could take a minute...</Note>
                        </div>
                    </div>
                ) : null
                }
                <p className="py-1">{images.length}/{props.maxImages} (maximum images allowed)</p>
            </div>
            {props.error ? <Note customColor="danger">{props.error}</Note> : null}
        </div>
    )
}

export default ImagesInput;

/*  disabled={props.maxImages === images.length ? "disabled" : false} */