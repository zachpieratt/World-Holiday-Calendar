document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  let selectCountry = document.getElementById('countrySelect');
  const currentYear = new Date().getFullYear();

  // Save selected country to chrome storage
  selectCountry.addEventListener('change', function () {
    chrome.storage.local.set({ savedCountry: document.getElementById('countrySelect').value });
    getHolidays();

  })

  const getCountries = () => {
    //Access saved country from chrome storage
    let savedCountry = '';
    chrome.storage.local.get('savedCountry', function (data) {
      savedCountry = data.savedCountry;
    });
    fetch('https://date.nager.at/api/v3/AvailableCountries')
      .then(response => response.json())
      .then(data => {
        data.forEach(item => {
          // Create a new option element
          const option = document.createElement('option');
          option.value = item.countryCode; // Set the value
          option.textContent = item.name; // Set the text

          // Append the option to the select element
          selectCountry.appendChild(option);
        });
        selectCountry.value = savedCountry
      })
      .then(() => getHolidays())
      .catch(error => console.log(error));
  }

  const getHolidays = () => {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      fixedWeekCount: false,
      titleFormat: {
        month: 'long'
      },
      showNonCurrentDates: false,
      buttonText: {
        today: 'Today'
      },
      validRange: {
        start: `${currentYear}-01-01`,
        end: `${currentYear}-12-31`
      },
      events: function (fetchInfo, successCallback, failureCallback) {
        let selectedCountry = document.getElementById('countrySelect').value;
        fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${selectedCountry}`)
          .then(response => response.json())
          .then(data => {
            // Transform your API data to FullCalendar format if necessary
            const events = data.map(event => ({
              title: event.name,
              start: event.date,
              end: event.date
            }));
            successCallback(events);
          })
          .catch(error => failureCallback(error));
      }
    });
    calendar.render();
  }
  getCountries()
});
