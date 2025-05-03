
const GoneLink = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center text-center p-4">
      <img
        src="https://res.cloudinary.com/djsj0pfm3/image/upload/v1746286772/batgone-transp_ff1qk7.png"
        alt="410 Gone Bat Mascot"
        width={250}
        height={250}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold text-error">Erreur</h1>
      <p className="text-lg text-base-content mt-2 max-w-md">
        Ce lien n'existe plus ou a expiré. Il a définitivement disparu… 
      </p>
    </div>
  );
};

export default GoneLink;
