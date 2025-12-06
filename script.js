class SunriseSunsetDashboard {
  constructor() {
    // Form elements
    this.form = document.getElementById("location-form");
    this.select = document.getElementById("preset-locations");
    this.getDataBtn = document.getElementById("get-data-btn");
    this.clearBtn = document.getElementById("clear-btn");

    // Inline error under form
    this.formError = document.getElementById("form-error");

    // Optional geolocation button
    this.geoBtn = document.getElementById("use-location-btn");

    // Dashboard elements
    this.todayCard = {
      sunrise: document.getElementById("today-sunrise"),
      sunset: document.getElementById("today-sunset"),
      dawn: document.getElementById("today-dawn"),
      dusk: document.getElementById("today-dusk"),
      daylength: document.getElementById("today-daylength"),
      noon: document.getElementById("today-noon"),
      tz: document.getElementById("today-tz"),
      date: document.getElementById("today-date")
    };

    this.tomorrowCard = {
      sunrise: document.getElementById("tomorrow-sunrise"),
      sunset: document.getElementById("tomorrow-sunset"),
      dawn: document.getElementById("tomorrow-dawn"),
      dusk: document.getElementById("tomorrow-dusk"),
      daylength: document.getElementById("tomorrow-daylength"),
      noon: document.getElementById("tomorrow-noon"),
      tz: document.getElementById("tomorrow-tz"),
      date: document.getElementById("tomorrow-date")
    };

    // Location info display
    this.locationText = document.getElementById("location-text");

    // Bind events
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.clearBtn.addEventListener("click", this.clearDashboard.bind(this));

    if (this.geoBtn) {
      this.geoBtn.addEventListener("click", () => this.getCurrentLocation());
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.clearError();
    const selectedOption = this.select.selectedOptions[0];
    if (!selectedOption || !selectedOption.dataset.lat) {
      this.showError("Please select a valid location.");
      return;
    }
    const lat = selectedOption.dataset.lat;
    const lon = selectedOption.dataset.lon;
    const locationName = selectedOption.textContent;

    this.fetchAndDisplayData(lat, lon, locationName);
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError("Geolocation is not supported by your browser.");
      return;
    }

    this.clearError();
    this.locationText.textContent = "Fetching data for your current location...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.fetchAndDisplayData(lat, lon, "Your Location");
      },
      (err) => {
        this.showError(`Geolocation error (${err.code}): ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }

  async fetchAndDisplayData(lat, lon, locationName) {
    this.locationText.textContent = `Fetching data for ${locationName}...`;

    try {
      const [todayData, tomorrowData] = await Promise.all([
        this.fetchSunriseSunset(lat, lon),
        this.fetchSunriseSunset(lat, lon, 1)
      ]);

      this.updateDashboard(todayData, this.todayCard);
      this.updateDashboard(tomorrowData, this.tomorrowCard);

      const timezone = todayData.timezone || "Local";
      this.todayCard.tz.textContent = timezone;
      this.tomorrowCard.tz.textContent = timezone;

      // Update location display in-place
      this.locationText.textContent = `Showing data for ${locationName}`;
    } catch (err) {
      this.showError(`Error fetching data: ${err.message}`);
    }
  }

  async fetchSunriseSunset(lat, lon, offsetDays = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD

    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lon}&date=${dateString}&formatted=1`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();
    if (data.status !== "OK") throw new Error(data.status || "Unknown API error");

    return data.results;
  }

  updateDashboard(data, card) {
    card.sunrise.textContent = data.sunrise || "Not available";
    card.sunset.textContent = data.sunset || "Not available";
    card.dawn.textContent = data.dawn || "Not available";
    card.dusk.textContent = data.dusk || "Not available";
    card.daylength.textContent = data.day_length || "Not available";
    card.noon.textContent = data.solar_noon || "Not available";
    const date = new Date();
    card.date.textContent = date.toLocaleDateString();
  }

  showError(message) {
    this.formError.textContent = message;
    this.formError.classList.remove("hidden");
  }

  clearError() {
    this.formError.textContent = "";
    this.formError.classList.add("hidden");
  }

  clearDashboard() {
    this.locationText.textContent = "No location selected. Choose a location and press Get Data.";
    [this.todayCard, this.tomorrowCard].forEach(card => {
      Object.keys(card).forEach(key => card[key].textContent = "—");
    });
    this.clearError();
  }
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => new SunriseSunsetDashboard());
