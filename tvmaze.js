"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const REQUEST_BASE_URL = "http://api.tvmaze.com";
const NULL_IMG_URL = "https://tinyurl.com/tv-missing";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  console.log('getShowByTerm called with', term);
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const showRequestBaseURL = `${REQUEST_BASE_URL}/search/shows`;
  console.log(showRequestBaseURL);

  // make a request and extract these data -> id, name, summary, image
  const response = await axios.get(showRequestBaseURL, { params: { q: term } });
  console.log('finished awaiting', response.data);

  const searchResults = response.data.map(item => {
    console.log("item=", item);
    const image = item.show.image
      ? item.show.image.medium
      : NULL_IMG_URL;

    const summary = item.show.summary
      ? item.show.summary
      : "No summary available";

    const showObject = {
      id: item.show.id,
      name: item.show.name,
      summary: summary,
      image: image,
    };

    console.log("resulting object:", showObject);
    return showObject;
  });

  console.log('All results', searchResults);
  return searchResults;
}



/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  console.log('displayShows', shows);
  $showsList.empty();

  for (const show of shows) {

    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);

  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});



/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  console.log('getEpisodesOfShow ran with id', id);
  const episodeRequestBaseURL = `${REQUEST_BASE_URL}/shows/${id}/episodes`;
  const response = await axios.get(episodeRequestBaseURL);

  const searchResults = response.data.map(item => {
    const showObject = {
      id: item.id,
      name: item.name,
      season: item.season,
      number: item.number,
    }

    console.log("resulting object:", showObject);
    return showObject;
  });

  return searchResults;
}

/** Takes in an array of episodes data and publishes it to the DOM;
 *  An episode is { id, name, season, number } */

function displayEpisodes(episodes) {
  console.log('displayEpisodes', episodes);
  $episodesList.empty();

  for (let episode of episodes) {
    const $li = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($li);
  }

  $episodesArea.show();
}

// add other functions that will be useful / match our structure & design



/** Retrieves a list of episodes and publishes their data to the DOM */
async function requestEpisodesAndDisplay(evt) {
  const id = $(evt.target).closest('.Show').attr('data-show-id');

  const episodes = await getEpisodesOfShow(id);
  displayEpisodes(episodes);
}


$showsList.on("click", '.Show-getEpisodes', requestEpisodesAndDisplay);