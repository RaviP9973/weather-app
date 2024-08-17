const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');
const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
let displayNotFound = document.querySelector('.not-found');

let currentTab = userTab;

window.addEventListener("offline", function() {
    console.log("Disconnected...so sad!!!")
  })


grantAccessContainer.classList.add('active');
let api_key = "57679222a09d40a0b6b164232241706";
currentTab.classList.add('current-tab');

userTab.addEventListener('click',() => {
    switchTab(userTab);
});

searchTab.addEventListener('click', () =>{
    switchTab(searchTab);
})

function switchTab(current){
    if(current === currentTab){
        return;
    }else {
        currentTab.classList.remove('current-tab');
        currentTab = current;
        currentTab.classList.add('current-tab');
        displayNotFound.classList.remove('active');

        if(!searchForm.classList.contains('active')){
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            searchForm.classList.add('active');
        }else{
            userInfoContainer.classList.remove('active');
            searchForm.classList.remove('active');
            getFromSessionStroage();
        }

    }
}

// check if cordinates are already present 
function getFromSessionStroage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        grantAccessContainer.classList.add('active');

    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    grantAccessContainer.classList.remove('active');

    loadingScreen.classList.add('active');

    try{
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${api_key}&q=${lat},${lon}`) ;
        const data = await response.json();
        // console.log(data);
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }catch(err){
        loadingScreen.classList.remove('active');
        //hw
        console.log('error found ' + err);
    }
}



 async function renderWeatherInfo(weatherInfo){
    const city = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherdesc]');
    const weatherIcon  = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windSpeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');


    city.innerText = weatherInfo?.location?.name;
    let countryName = weatherInfo.location.country.toLowerCase();
    const countryInfo = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
    let countryData = await countryInfo.json();
    let countryId = await countryData[0].cca2;
    // console.log(countryId);

    countryIcon.src = `https://flagcdn.com/144x108/${countryId.toLowerCase()}.png`;
    desc.innerText =  weatherInfo?.current?.condition?.text;
    let weatherIconSrc = weatherInfo?.current?.condition?.icon;
    // console.log(weatherIconSrc);
    let source = String(weatherIconSrc.substring(2));
    // console.log(source);
    source = "https://" + source;

    weatherIcon.src = source;
    temp.innerText = weatherInfo?.current?.temp_c + ' °c';
    windspeed.innerText = weatherInfo?.current?.wind_kph + ' km/h';
    humidity.innerText = weatherInfo?.current?.humidity + '%';
    cloudiness.innerText = weatherInfo?.current?.cloud + '%';
}



function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        //hw show an alert for no geoloaction support available.
        alert('geo laoction is not supported in you system');
    }
}


function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem('user-coordinates',JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click',getLocation);  


const searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return ;
    }else{
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');

    try{
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${city}`) ;

        const data = await response.json();
        // console.log(data);
        if(data?.error?.code === 1006){
            
            displayNotFound.classList.add('active');
            userInfoContainer.classList.remove('active');
            loadingScreen.classList.remove('active');
            return;
        }
        loadingScreen.classList.remove('active');

        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);

    }catch(e){
        //hw
        // console.log(e);
        
    }
}
