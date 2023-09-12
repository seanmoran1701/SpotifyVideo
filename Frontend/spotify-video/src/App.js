
import { useEffect, useState } from 'react';
import SpotifyWebApi from "spotify-web-api-js"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import YouTube from 'react-youtube';
import './App.css';
//import { Container } from '@mui/material';
//AIzaSyCjisIjQyKylG1m356fzHS_tTd4MldSmEI

const spotifyApi = new SpotifyWebApi();
var currentVideo = 0;
var isFirstVideo = 1;
var currentPlaylistSize = 0;
var idFound = 0;
const clientId = "1b4fa81586144395b6fa1ce3a8f84bc5";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");


/*const getToken = () => {
    return window.loaction.hash
        .substring(1)
        .split("&")
        .reduce((initial, item) => {
            let parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
            return initial;
        }, {});

};*/

const localUrl = 'http://localhost:8888';
const publicUrl = 'https://spotifyvideo-production.up.railway.app/';
function App() {
    const [videoUrl, setVideoUrl] = useState([]);
    const [playlistClick, setplaylistClick] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [firstLoaded, setFirstLoaded] = useState([]);

    useEffect(() => {
        
        if (window.location.hash) {
            const hash = window.location.hash;
            const list = hash.split('&');

            console.log(list);

            const spotifyToken = list[0].substring(14);
            window.location.hash = "";

            if (spotifyToken) {
                //setSpotifyToken(spotifyToken);
                spotifyApi.setAccessToken(spotifyToken);
                setLoggedIn(true);
            }
        }
    })
    function getPlaylists() {
        setplaylistClick(false);
        idFound = 0;
        spotifyApi.getUserPlaylists({offset: 0, limit: 50 }).then((response) => {
            setPlaylists(response.items);


            console.log(response);

        })
    }
    
    function loadFirstVideo(playlist) {
        isFirstVideo = 1;
        sessionStorage.setItem('id', '');
        playListClicked(playlist);
        sessionStorage.setItem('id', videoUrl);
        setFirstLoaded(['true']);
        console.log('first video loaded');
    }
    async function playListClicked(playlist) {
        currentVideo = 0;
        setplaylistClick(true);
        var playlistSongs;
        await spotifyApi.getPlaylistTracks(playlist.id).then((response) => {
            
            playlistSongs = response.items;
            currentPlaylistSize = playlistSongs.length;
            console.log(response);
            setSongs(playlistSongs);
            console.log(playlistSongs[currentVideo].track.name);
        })
        console.log('get video function');
        getVideo(playlistSongs);
        
    }
    async function getVideo(playlistSongs) {
        var artists = "";
        for (let i = 0; i < playlistSongs[currentVideo].track.artists.length; i++) {
            artists = artists + playlistSongs[currentVideo].track.artists[i].name + ' ';    
        }
        console.log(artists);
        var searchString = playlistSongs[currentVideo].track.name + ' ' + artists + 'video';
        var requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ search: searchString })
        };
        await fetch(publicUrl + '/setID', requestOptions)
            .then(response => console.log(response))
            //.catch(error => console.error('Error fetching data:', error));


        requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            
        };
        await fetch(publicUrl + '/getID', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data.id);
                setVideoUrl(data.id);
                idFound = 1;
            })
            .catch(error => console.error('Error fetching data:', error));

        //console.log(data.id);

        //setVideoUrl(response.id);
    }
    useEffect(() => {

        console.log("Changed songs: ", videoUrl)

    }, [videoUrl])


    //youtube video options
    const opts = {
        height: '648',
        width: '1152',
        playerVars: {

            autoplay: 1,
        }
    }
    function _onReady(event) {
        // If loaded video is first in play list run onEnd function
        if (isFirstVideo == 1) {
            //_onEnd();
            console.log(currentVideo);
            sessionStorage.setItem('id', currentVideo);
            isFirstVideo = 0;
        }
    }
    //function loads the video after next. When next button clicked previously loaded video plays
    function _onEnd(event) {
        
        //wrap around to beginning of playlist if at end, else increment
        if (currentPlaylistSize-1 != currentVideo) {
            currentVideo = currentVideo + 1;
        } else { currentVideo = 0; }
        //get current video
        
        getVideo(songs);
        //set video id in local storage
        sessionStorage.setItem('id', videoUrl);
        
        console.log('current video: ' + currentVideo);
        
        //console.log(songs);
        
        
    }
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

        setSongs(array);
}
    


    return (
        <div className="App">
            {!loggedIn && <a href={publicUrl}>Login to Spotify</a>}

            <div style={{ float: 'left', marginLeft: 10, marginTop: 10}}>
                {loggedIn && <button onClick={() => getPlaylists()}>GET PLAYLISTS</button>}
            </div>

            {playlists && !playlistClick &&
                <Container>

                    <Row className='mx-2 row row-cols-4'>
                        {playlists.map((playlist, i) => {
                            return (
                                <button onClick={() => loadFirstVideo(playlist)}>
                                    <Card>
                                        {playlist.images[0] &&
                                            < Card.Img src={playlist.images[0].url} />
                                        }
                                        <Card.Body>
                                            <Card.Title>{playlist.name}</Card.Title>
                                        </Card.Body>
                                    </Card>
                                </button>
                            )
                        })}
                    </Row>
                </Container>
            }
            {playlistClick &&
                <div style={{ position: 'absolute', right: 0, marginRight: 10, marginTop: 10 }}>
                    <button onClick={() => _onEnd()}> NEXT </button>
                    <div style={{ position: 'relative', marginTop: 10 }}>
                        <button onClick={() => shuffle(songs)}> SHUFFLE </button>
                    </div>
                </div>
            }
            
            {playlistClick && idFound == 1 &&
                <div style={{ position:'absolute',zIndex: -1,left: 50, right: 0, marginLeft: 'auto', marginRight: 'auto' }}>
                <YouTube videoId={videoUrl} opts={opts} onReady={_onReady} onEnd={_onEnd}  />
            </div>
            }
        </div>
    );
}



export default App;
