import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const CreateAlbum = () => {
    const [form, setForm ] = useState({
        month: "",
        theme: "",
    })
    const [isNew, setIsNew] = useState(true)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchData() {
            const id = params.id?.toString() || undefined
            if(!id) return
            setIsNew(false) // because we are updating
            const response = await fetch(
                `http://localhost:5000/album/${params.id.toString()}`
            )
            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`
                console.error(message)
                return
            }
            const album = await response.json()
            if(!album){
                console.warn(`Album with id ${id} not found`)
                navigate("/")
                return
            }
            setForm(album)
        }
        fetchData()
        return
    }, [params.id, navigate])

    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value }
        })
    }

    async function onSubmit(e) {
        e.preventDefault()
        const newAlbum = { ...form }
        try {
            let response
            if(isNew){
                //if we are adding a new album we will POST to /album
                response = await fetch("http://localhost:5000/album", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAlbum)
                })
            } else {
                // if we are updating a record we will PATCH to /album/:id
                response = await fetch(`http://localhost:5000/album/${params.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAlbum)
                })
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error)
        } finally {
            setForm({ month: "", theme: ""})
            navigate("/")
        }
    }
}

export default CreateAlbum