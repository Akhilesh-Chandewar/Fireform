import { useEffect, useState } from "react";
import { Auth } from "./components/auth";
import { db, auth, storage } from "./config/firebase";
import {
  getDocs, collection, addDoc, deleteDoc, updateDoc, doc,
} from "firebase/firestore";
import { ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "firebase/storage";

function App() {
  const [movieList, setMovieList] = useState([]);
  const [fileList, setFileList] = useState([]);

  // New Movie States
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState(0);
  const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);

  // Update Title State
  const [updatedTitle, setUpdatedTitle] = useState("");

  // File Upload State
  const [fileUpload, setFileUpload] = useState(null);

  const moviesCollectionRef = collection(db, "movies");

  const getMovieList = async () => {
    try {
      const data = await getDocs(moviesCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMovieList(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const getFileList = async () => {
    const filesFolderRef = ref(storage, 'projectFiles');
    try {
      const fileListSnapshot = await listAll(filesFolderRef);
      const filePromises = fileListSnapshot.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      });
      const files = await Promise.all(filePromises);
      setFileList(files);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getMovieList();
    getFileList();
  }, []);

  const onSubmitMovie = async () => {
    if (!auth.currentUser) {
      alert("Please log in to submit a movie.");
      return;
    }
    try {
      await addDoc(moviesCollectionRef, {
        title: newMovieTitle,
        releaseDate: newReleaseDate,
        receivedAnOscar: isNewMovieOscar,
        userId: auth.currentUser.uid,
      });
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMovie = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await deleteDoc(movieDoc);
    getMovieList();
  };

  const updateMovieTitle = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { title: updatedTitle });
    getMovieList();
  };

  const uploadFile = async () => {
    if (!auth.currentUser) {
      alert("Please log in to upload files.");
      return;
    }
    if (!fileUpload) return;
    const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
    try {
      await uploadBytes(filesFolderRef, fileUpload);
      getFileList();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFile = async (fileName) => {
    const fileRef = ref(storage, `projectFiles/${fileName}`);
    try {
      await deleteObject(fileRef);
      getFileList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App bg-gray-100 min-h-screen p-4">
      <Auth />

      <div className="my-4 p-4 bg-white rounded shadow-md">
        <input
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded"
          placeholder="Movie title..."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded"
          placeholder="Release Date..."
          type="number"
          onChange={(e) => setNewReleaseDate(Number(e.target.value))}
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={isNewMovieOscar}
            onChange={(e) => setIsNewMovieOscar(e.target.checked)}
          />
          <label className="ml-2">Received an Oscar</label>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onSubmitMovie}
        >
          Submit Movie
        </button>
      </div>

      <div>
        {movieList.map((movie) => (
          <div key={movie.id} className="my-2 p-4 bg-white rounded shadow-md">
            <h1 className={movie.receivedAnOscar ? "text-green-500" : "text-red-500"}>
              {movie.title}
            </h1>
            <p>Date: {movie.releaseDate}</p>

            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
              onClick={() => deleteMovie(movie.id)}
            >
              Delete Movie
            </button>

            <input
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded"
              placeholder="new title..."
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => updateMovieTitle(movie.id)}
            >
              Update Title
            </button>
          </div>
        ))}
      </div>

      <div className="my-4 p-4 bg-white rounded shadow-md">
        <input
          type="file"
          onChange={(e) => setFileUpload(e.target.files[0])}
          className="mb-2"
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={uploadFile}
        >
          Upload File
        </button>
      </div>

      <div className="my-4 p-4 bg-white rounded shadow-md">
        {fileList.map((file) => (
          <div key={file.name} className="flex items-center justify-between mb-2">
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {file.name}
            </a>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => deleteFile(file.name)}
            >
              Delete File
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
