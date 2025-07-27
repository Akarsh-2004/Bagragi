import React from 'react';

const BackgroundVideo = () => {
    return(
        <video autoPlay loop muted className="fixed top-0 left-0 w-full h-full object-cover -z-10" style={{ filter: 'blur(4px) brightness(60%)' }}>
            <source src='/bgVideo.mp4' type="video/mp4"/>
        </video>
    );
};

export default BackgroundVideo;