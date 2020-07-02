import React, { useCallback, useState, useRef } from 'react';
import {useDropzone} from 'react-dropzone';
import ReactCrop from 'react-image-crop';
import { getCroppedImg } from '../../Utils/image-preview';
import 'react-image-crop/dist/ReactCrop.css';
import * as firebase from 'firebase';
import './HomePage.css';

const HomePage = () => {

    const [files, setFiles] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [downloadUrls, setDownloadUrls] = useState([]);
    const [hasError, setError] = useState('');
    const [previewImg, setPrevImg] = useState([]);
    const imageRef = useRef(null);
    const scrollToPreview = useRef(null);
    const [cropConfig, setCropConfig] = useState([
      {
        unit: 'px',
        x: 0,
        y: 0,
        aspect: 1.68,
        width: 755,
        height: 450,
        recommendedWidth: 755,
        recommendedHeight: 450,
        cropType: 'Horizontal'
      },
      {
        unit: 'px',
        x: 0,
        y: 0,
        width: 365,
        height: 450,
        recommendedWidth: 365,
        recommendedHeight: 450,
        aspect: 0.81/1,
        cropType: 'Vertical'
      },
      {
        unit: 'px',
        x: 0,
        y: 0,
        width: 365,
        height: 212,
        recommendedWidth: 365,
        recommendedHeight: 212,
        aspect: 1.72,
        cropType: 'Horizontal small'
      },
      {
        unit: 'px',
        x: 0,
        y: 0,
        aspect: 1/1,
        width: 380,
        height: 380,
        recommendedWidth: 380,
        recommendedHeight: 380,
        cropType: 'Gallery'
      }
    ]);
    const [currentCropStep, setCurrentCropStep] = useState(0);


    const onDrop = useCallback(files => {
      setDownloadUrls([]);
      if (files.length) {
        const RES_LIM = 1024;
        const image = new Image();
        image.addEventListener('load', () => {
            if (image.width === RES_LIM & image.height === RES_LIM) {
              files.forEach(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
              setFiles(files);
              setError('');
            } else {
              setFiles([]);
              setError('File resolution should be 1024 x 1024');
            }
        });
        image.src = URL.createObjectURL(files[0])
      } else {
        setFiles([]);
        setError('Only image files allowed');
      }
    }, []);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
      accept: 'image/*',
      multiple: false,
      onDrop
    });

    const moveStep = (direction) => {
      if (direction === 'next' && currentCropStep < cropConfig.length - 1) {
        setCurrentCropStep(currentCropStep + 1);
      } else if (direction === 'prev' && currentCropStep > 0) {
        setCurrentCropStep(currentCropStep - 1);
      }
    }

    const preview = () => {
      const previewImgPromises = cropConfig.map((config, i) => {
        return getCroppedImg(imageRef.current, config, `config-${i}`);
      });
      Promise.all(previewImgPromises)
        .then(prev => {
          const img = prev.map((imgBlob, i) => {
            const cnf = cropConfig[i];
            const altTitle = `preview ${i + 1} | ${cnf.height}x${cnf.width}`;
            return {
              img: <img key={i} src={URL.createObjectURL(imgBlob)} height={cnf.height} width={cnf.width} alt={altTitle} title={altTitle} />,
              blob: imgBlob
            }
          });
          setPrevImg(img);
          window.scrollTo(0, scrollToPreview.current.offsetTop)
        }).catch(err => {
          console.log(err);
        });
    }

    const handleChange = (crop, pixelCrop) => {
      const newState = cropConfig.map((config, i) => (i === currentCropStep) ? crop : config)
      setCropConfig(newState);
      setPrevImg([]);
    }

    const cropNavigation = (
      <div className="d-flex space-between crop-navigation">
        <button disabled={currentCropStep === 0} onClick={ () => moveStep('prev') }>Prev</button>
        <div className="crop-navigation-step">
          Step : { currentCropStep + 1 } / {cropConfig.length} |
          {' '}
          {cropConfig[currentCropStep].cropType} | Recommended resolution : {cropConfig[currentCropStep].recommendedWidth} x {cropConfig[currentCropStep].recommendedHeight}
          {' '}
          <button onClick={preview}>Preview all</button>
        </div>
        <button disabled={currentCropStep === cropConfig.length - 1} onClick={ () => moveStep('next') }>Next</button>
      </div>
    );

    const thumbs = files.map(file => (
      <div className="thumb" key={file.name}>
        {cropNavigation}
        <img src={file.preview} ref={imageRef} style={{display: 'none'}} />
        <ReactCrop src={file.preview} crop={cropConfig[currentCropStep]} onChange={handleChange} />
        {cropNavigation}
      </div>
    ));

    const handleUpload = () => {
      setIsUploading(true);
      const storageRef = firebase.storage().ref();
      const uploadPromises = previewImg.map((prev, i) => {
        return storageRef.child(`/${fileName}-${Math.random().toString()}-${cropConfig[i].cropType}`).put(prev.blob).then(uploadTaskSnapshot => {
          return uploadTaskSnapshot.ref.getDownloadURL();
        });
      });
      Promise.all(uploadPromises).then(data => {
        setDownloadUrls([...data]);
        setPrevImg([]);
        setIsUploading(false);
      }).catch(err => console.log(err));
    };
  
    const handleFileName = (e) => {
      setFileName(e.target.value);
    };

    return (
      <main className="main-container">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {
            isDragActive ?
                <p>Drop the files here ...</p> :
                <div className="drag-and-drop-section">
                    <p>Drop your image here or select a file</p>
                </div>
          }
        </div>
        { (files.length) ? thumbs : null }
        <p className="text-center text-danger">{ hasError }</p>
        {
          (previewImg.length) ? 
          <div className="preview-wrapper">
            <div className="preview-controls">
              <h3 ref={scrollToPreview}>Image Preview:</h3> {' '}
              <div className="upload-section">
                <input type="text" onChange={handleFileName} placeholder="File name to save" className="form-control" />
                <button className="upload-btn" onClick={handleUpload}>Upload to cloud!</button>
              </div>
            </div>
            <div className="preview-section">
              {previewImg.map(prev => prev.img)}
            </div>
          </div> : null
        }
        { (downloadUrls.length) ? 
            <>
              <h4 className="text-center">Click links to download</h4>
              <ul className="text-center download-urls">
                { 
                  downloadUrls.map((url, i) => (<li key={i}><a href={url} target="_blank" download>{cropConfig[i].cropType} image</a></li>))
                }
              </ul>
            </>
          : null
        }
        {
          isUploading && <div className="loading">
            Uploading...
          </div>
        }
      </main>
  );
};

export default HomePage;