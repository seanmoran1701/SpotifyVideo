
import { useEffect, useState } from 'react';
import SpotifyWebApi from "spotify-web-api-js"
import 'bootstrap/dist/css/bootstrap.min.css'
import { Container, InputGroup, FormControl, Row, Card } from 'react-bootstrap';
import YouTube from 'react-youtube';
import './App.css';

//component imports
import ButtonGroup from './ButtonGroup'
import IconButton from '@mui/material/IconButton';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

//const spotifyApi = new SpotifyWebApi();
var currentVideo = 0;
var isFirstVideo = 1;
var currentPlaylistSize = 0;
var idFound = 0;
const clientId = "1b4fa81586144395b6fa1ce3a8f84bc5";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

var targetPlayer;
var username = "";

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
//const scraperUrl = 'http://localhost:4444';
const scraperUrl = 'https://spotscraper-production.up.railway.app';
//const publicUrl = 'http://localhost:8888';
const publicUrl = 'https://spotifyvideo-production.up.railway.app';
function App() {
    const [videoUrl, setVideoUrl] = useState([]);
    const [playlistClick, setplaylistClick] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [firstLoaded, setFirstLoaded] = useState([]);
    const [repeat, setRepeat] = useState(false);
    const [isLoading, setisLoading] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {

        if (window.location.hash) {
            const hash = window.location.hash;
            const list = hash.split('&');

            console.log(list);

            const spotifyToken = list[0].substring(14);
            window.location.hash = "";

            if (spotifyToken) {
                //setSpotifyToken(spotifyToken);
                //spotifyApi.setAccessToken(spotifyToken);
                setLoggedIn(true);
            }
        }
    })
    async function setSpotifyPlaylist(playlist) {
        var requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist: playlist})
        };
        await fetch(scraperUrl + '/setPlaylist', requestOptions)
            .then(response => console.log("Playlist set in backend"))
            .catch(error => console.error('Error fetching data:', error));
    }
    async function getSpotifyPlaylists(user) {
        var requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'user-agent': 'sean.moran1701' },

        };

        await fetch(scraperUrl + '/getPlaylists', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setPlaylists(data);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    async function getSpotifySongs(user) {
        var playlistSongs;
        var requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'user-agent': 'sean.moran1701' },

        };

        await fetch(scraperUrl + '/getSongs', requestOptions)
            .then(response => response.json())
            .then(data => {
                playlistSongs = data;
                currentPlaylistSize = playlistSongs.length;
                console.log(playlistSongs);
                setSongs(playlistSongs);
                //console.log(playlistSongs[currentVideo].track.name);
            })
            .catch(error => console.error('Error fetching data:', error));

        return playlistSongs;
    }
    async function getPlaylists() {
        setisLoading(true);
        setplaylistClick(false);
        idFound = 0;
        setRepeat(false);
        
        if (playlists.length != 0) {
            setisLoading(false);
            return;
        }
        ///////////////////////////////////////////////////
        await getSpotifyPlaylists()
        ////////////////////////////////////////////////////
        setisLoading(false);
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
        setisLoading(true);
        currentVideo = 0;
        setplaylistClick(true);
        setRepeat(false);


        console.log(playlist.href);
        await setSpotifyPlaylist(playlist.href);
        var playlistSongs = await getSpotifySongs();
        /////////////////////////////
        /*await spotifyApi.getPlaylistTracks(playlist.id).then((response) => {
            
            playlistSongs = response.items;
            currentPlaylistSize = playlistSongs.length;
            console.log(response);
            setSongs(playlistSongs);
            console.log(playlistSongs[currentVideo].track.name);
        })*/
        console.log('get video function');
        ////////////////////////////////////
        getVideo(playlistSongs);
        setisLoading(false);
    }
    async function getVideo(playlistSongs) {
        console.log(playlistSongs);
        var artists = playlistSongs[currentVideo].artists;
        
        console.log(playlistSongs[currentVideo].artists);
        var searchString = playlistSongs[currentVideo].name + ' ' + artists + 'music video';
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

    useEffect(() => {

        console.log("Toggle repeat: ", repeat)

    }, [repeat])

    useEffect(() => {

        console.log("Toggle loading: ", isLoading)

    }, [isLoading])


    //youtube video options
    const opts = {
        height: '648',
        width: '1152',
        playerVars: {
            autoplay: 1,
        }
    }
    function _onReady(event) {
        targetPlayer = event.target;
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
        
        if (!repeat) {
            //wrap around to beginning of playlist if at end, else increment
            if (currentPlaylistSize - 1 != currentVideo) {
                currentVideo = currentVideo + 1;
            } else { currentVideo = 0; }

            //get current video
            getVideo(songs);
        } else { targetPlayer.seekTo(0);}
        //set video id in local storage
        sessionStorage.setItem('id', videoUrl);
        
        console.log('current video: ' + currentVideo);
        
        //console.log(songs);
        
        
    }

    function previous(event) {
        if (!repeat) {
            //wrap around to beginning of playlist if at end, else increment
            if (currentVideo > 0) {
                currentVideo = currentVideo - 1;
            } else { currentVideo = currentPlaylistSize - 1; }


            //get current video
            getVideo(songs);
        }
        //set video id in local storage
        sessionStorage.setItem('id', videoUrl);

        console.log('current video: ' + currentVideo);
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

    function repeatVideo() {
        
        if (!repeat) { setRepeat(true); }
        else { setRepeat(false); }
    }

    async function submitUsername() {
        console.log(username);
        var requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        };
        await fetch(scraperUrl + '/setUser', requestOptions)
            .then(response => console.log("login"))
            .catch(error => console.error('Error fetching data:', error));

        setLoggedIn(true);
    }

    const handleTextFieldChange = e => {
        setUsername(e.target.value);
     
    }
//Components
//-----------------------------------------------------------------------------
    const videoPlayer = <YouTube videoId={videoUrl} opts={opts} onReady={_onReady} onEnd={_onEnd} />;
    
    
    const buttons = [
        <IconButton onClick={() => _onEnd()} aria-label="next" size="large">
            <SkipNextIcon fontSize="inherit" />
        </IconButton>,
        <IconButton onClick={() => previous()} aria-label="prev" size="large">
            <SkipPreviousIcon fontSize="inherit" />
        </IconButton>,
        <IconButton onClick={() => shuffle(songs)} aria-label="shuffle" size="large">
            <ShuffleIcon fontSize="inherit" />
        </IconButton>,
        <IconButton onClick={() => repeatVideo()} aria-label="repeat" size="large">
            {repeat ?
                <RepeatOnIcon fontSize="inherit" />
                :
                <RepeatIcon fontSize="inherit" />
            }

        </IconButton>
    ];

    return (
        <div className="App">
            {/*{!loggedIn && <a href={publicUrl + '/login'}>Login to Spotify</a>}*/}
            <div style={{ marginTop: 10 }}>
                {!loggedIn && <TextField id="standard-basic" label="Spotify Username" variant="outlined" value={username} onChange={handleTextFieldChange}/>}
                {!loggedIn && <Button style={{ marginTop: 10, marginLeft: 10}} onClick={() => submitUsername()} variant="contained" >SUBMIT</Button>}
            </div>
            <div style={{ float: 'left', marginLeft: 10, marginTop: 10, marginRight: 10}}>
                {loggedIn && <Button onClick={() => getPlaylists()} variant="contained">GET PLAYLISTS</Button>}
                
            </div>
            {isLoading && <CircularProgress style={{ position: 'absolute', zIndex: -1, left: 0, right: 0, marginTop: 10,marginLeft: 'auto', marginRight: 'auto'}}></CircularProgress>}
            {playlists && !playlistClick &&
                <Container>

                    <Row className='mx-2 row row-cols-4'>
                        {playlists.map((playlist, i) => {
                            return (
                                <button onClick={() => loadFirstVideo(playlist)}>
                                    <Card>
                                        {playlist.image &&
                                            < Card.Img src={playlist.image} />
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
                <ButtonGroup buttons={buttons} />
                    
                </div>
            }
            
            {playlistClick && idFound == 1 &&
                <div style={{position:'absolute',zIndex: -1,left: 50, right: 0, marginLeft: 'auto', marginRight: 'auto' }}>
                <YouTube videoId={videoUrl} opts={opts} onReady={_onReady} onEnd={_onEnd}  />
            </div>
            }
        </div>
    );
}

//<button onClick={() => _onEnd()}> NEXT </button>
//   <div style={{ position: 'relative', marginTop: 10 }}>
//         <button onClick={() => shuffle(songs)}> SHUFFLE </button>
//   </div>

export default App;
