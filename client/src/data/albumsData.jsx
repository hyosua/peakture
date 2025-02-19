import landscape from "../assets/img/albums/decembre/landscape.jpg";
import landscape2 from "../assets/img/albums/decembre/landscape2.jpg";
import landscape3 from "../assets/img/albums/decembre/landscape3.jpg";
import landscape4 from "../assets/img/albums/decembre/landscape4.jpg";

import bw1 from "../assets/img/albums/janvier/bw1.jpg";
import bw2 from "../assets/img/albums/janvier/bw2.jpg";
import bw3 from "../assets/img/albums/janvier/bw3.jpg";
import bw4 from "../assets/img/albums/janvier/bw4.jpg";

import motion from "../assets/img/albums/fevrier/motion.jpg";
import motion2 from "../assets/img/albums/fevrier/motion2.jpg";  
import motion3 from "../assets/img/albums/fevrier/motion3.jpg";
import motion4 from "../assets/img/albums/fevrier/motion4.jpg";

const localAlbums = [
    {month: "Décembre", theme: "Landscape", winner: "Alicia", cover: landscape,
        photos: [
            {id: "dec-1",src: landscape},
            {id: "dec-2",src: landscape2},
            {id: "dec-3",src: landscape3},
            {id: "dec-4",src: landscape4}
        ]
    },
    {month: "Janvier", theme: "Black & White", winner: "Bob", cover: bw1, 
        photos: [
            {id: "jan-1", src: bw1},
            {id: "jan-2", src: bw2},
            {id: "jan-3", src: bw3},
            {id: "jan-4", src: bw4}
        ]
    },
    {month: "Février", theme: "In Motion", winner: "Charlie", cover: motion,
        photos: [
            {id: "fev-1", src: motion}, 
            {id: "fev-2", src: motion2},
            {id: "fev-3", src: motion3},
            {id: "fev-4", src: motion4}
        ]
    }
];

export default localAlbums;