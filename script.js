document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('location-form');
  const select = document.getElementById('preset-locations');
  const clearButton = document.getElementById('clear-button');
  const formError = document.getElementById('form-error');
  const locationText = document.getElementById('location-text');

  // fields for today/tomorrow cards
  const fields = ['sunrise', 'sunset', 'dawn', 'dusk', 'daylength', 'noon', 'timezone'];

  const today = {};
  const tomorrow = {};
  fields.forEach(f => {
    today[f] = document.getElementById(`today-${f}`);
    tomorrow[f] = document.getElementById(`tomorrow-${f}`);
  });

  const todayDateEl = document.getElementById('today-date');
  const tomorrowDateEl = document.getElementById('tomorrow-date');
  
  function clearDashboard() {
    locationText.textContent = 'No location selected. Choose a location and press Get Data.';
    todayDateEl.textContent = tomorrowDateEl.textContent = '—';
    fields.forEach(f => {
      today[f].textContent = '—';
      tomorrow[f].textContent = '—';
    });
  }
  //format date nicely for reading
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }
  
  //help deal with error message
  function showError(message) {
    formError.textContent = message;
    formError.classList.remove('hidden');
  }
    
  function clearError() {
    formError.textContent = '';
    formError.classList.add('hidden');
  }

  //fetch sunrise/sunset data from api
  async function fetchSunData(lat, lng, date='today') {
    const url = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${date}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data.status !== 'OK') throw new Error('API returned error');
      return data.results;
    } catch (err) {
      showError('Failed to fetch data. Try again later.');
      console.error(err);
    }
  }

  //update the result dashboard
  function updateDashboard(locationName, todayData, tomorrowData) {
    locationText.textContent = `Showing results for ${locationName}`;
    //today info
    todayDateEl.textContent = formatDate(new Date());
    today.sunrise.textContent = todayData.sunrise;
    today.sunset.textContent = todayData.sunset;
    today.dawn.textContent = todayData.dawn;
    today.dusk.textContent = todayData.dusk;
    today.daylength.textContent = todayData.day_length;
    today.noon.textContent = todayData.solar_noon;
    today.timezone.textContent = todayData.timezone;

    //Tomorrow info
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDateEl.textContent = formatDate(tomorrowDate);
    tomorrow.sunrise.textContent = tomorrowData.sunrise;
    tomorrow.sunset.textContent = tomorrowData.sunset;
    tomorrow.dawn.textContent = tomorrowData.dawn;
    tomorrow.dusk.textContent = tomorrowData.dusk;
    tomorrow.daylength.textContent = tomorrowData.day_length;
    tomorrow.noon.textContent = tomorrowData.solar_noon;
    tomorrow.timezone.textContent = tomorrowData.timezone;
  }


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const selected = select.selectedOptions[0];
    if (!selected || !selected.value) {
      showError('Please select a location.');
      return;
    }
    //access stored latitude and longitude
    const lat = selected.dataset.lat;
    const lng = selected.dataset.lon;
    const locationName = selected.textContent;

    // fetch today and tomorrow data
    const todayData = await fetchSunData(lat, lng, 'today');
    const tomorrowData = await fetchSunData(lat, lng, 'tomorrow');

    if (todayData && tomorrowData) {
      updateDashboard(locationName, todayData, tomorrowData);
    }
  });

// clear button
  clearButton.addEventListener('click', () => {
    clearDashboard();
    clearError();
    select.value = '';
  });

});
