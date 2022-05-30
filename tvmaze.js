"use strict";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $getEpisodes = $("#getEpisodes");
const missingImg = "https://tinyurl.com/tv-missing"


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get("http://api.tvmaze.com/search/shows", {params: {q: term}
    });
  console.log("response = ", response.data);

  if (response.data.length >= 1){

    return response.data.map(result => {
      const show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image ? show.image.medium : missingImg,
      }
    })

  } else {alert(`${term} not found! Try another show..`)}
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" id="getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return response.data.map(episode => ({
    // id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }))
 }

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $showsList.empty();
  for (let episode of episodes){
    const $ep = $(`<li>(S${episode.season}, E${episode.number}) - ${episode.name}</li>`)
    $episodesList.append($ep);
  }
  console.log("Episode list = ", $episodesList);
  $episodesArea.show();
}


$showsList.on("click", $getEpisodes, async function (evt){
  console.log("episode button clicked")

  const showId = $(evt.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
})

