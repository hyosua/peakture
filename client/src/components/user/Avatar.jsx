import React, { useState } from 'react';
import { X } from 'lucide-react';

const Avatar = ({ avatarSrc }) => {
    const [avatarFullscreen, setAvatarFullscreen] = useState(false);
    return (
        <div>
            <img 
                src={avatarSrc} 
                className="size-12 object-cover cursor-pointer rounded-box" 
                onClick={() => setAvatarFullscreen(true)}
                alt="User Avatar"
            />

            {avatarFullscreen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                    onClick={() => setAvatarFullscreen(false)}>
                    <img 
                        src={avatarSrc} 
                        className=" w-60 h-60 lg:w-96 lg:h-96  rounded-full object-cover"
                        onClick={() => setAvatarFullscreen(false)}
                        alt="User Avatar Fullscreen"
                    />
                </div>
            )}
        </div>
    );
}

export default Avatar;