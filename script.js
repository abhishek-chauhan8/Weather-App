document.addEventListener("DOMContentLoaded", () => {
  const userTab = document.querySelector("[data-userWeather]");
  const searchTab = document.querySelector("[data-searchWeather]");
  const userContainer = document.querySelector(".weather-container");
  const grantAccessContainer = document.querySelector(".grant-location-container");
  const searchForm = document.querySelector(".form-container");
  const loadingScreen = document.querySelector(".loading-container");
  const userInfoContainer = document.querySelector(".user-info-container");

  let currentTab = userTab;
  const APIKEY = "c328f330c23edfe66ebcbf1bb836a599";

  currentTab.classList.add("current-tab");

  getFromSessionStorage();

  function switchTab(clickedTab) {
    if (clickedTab !== currentTab) {
      currentTab.classList.remove("current-tab");
      currentTab = clickedTab;
      currentTab.classList.add("current-tab");

      if (currentTab === userTab) {
        userInfoContainer.classList.add("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.remove("active");
        getFromSessionStorage();
      } else if (currentTab === searchTab) {
        searchForm.classList.add("active");
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
      }
    }
  }

  userTab.addEventListener("click", () => {
    switchTab(userTab);
  });

  searchTab.addEventListener("click", () => {
    switchTab(searchTab);
  });

  function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
      grantAccessContainer.classList.add("active");
    } else {
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeatherInfo(coordinates);
    }
  }

  async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=metric`
      );

      if (!res.ok) {
        throw new Error("Weather data not found");
      }

      const data = await res.json();
      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
    } catch (error) {
      loadingScreen.classList.remove("active");
      console.error("Error fetching weather:", error);
    }
  }




  
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, () => {
        console.log("Geolocation error");
      });
    } else {
      console.log("No geolocation available");
    }
  }

  function showPosition(position) {
    const userCoordinates = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
  }

  const grantAccessButton = document.querySelector("[data-grantAccess]");
  grantAccessButton.addEventListener("click", getLocation);

  const searchInput = document.querySelector("[data-searchInput]");

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cityName = searchInput.value.trim();

    if (cityName === "") {
      return;
    }

    try {
      loadingScreen.classList.add("active");
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKEY}&units=metric`
      );

     

      const data = await response.json();
      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
    } catch (error) {
      loadingScreen.classList.remove("active");
      
    }
  });

  function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.webp`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
  }
});
