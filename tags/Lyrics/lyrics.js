import { genres } from "./tracks.js";

const previewCount = 3;
const params = new URLSearchParams(window.location.search);
const genreId = params.get("genre");
const trackId = params.get("track");
const content = document.querySelector(".lyrics-content");
const path = document.querySelector(".lyrics-path");
const heading = document.querySelector(".lyrics-intro h1");
const description = document.querySelector(".lyrics-description");
const coversUrl = new URL("./covers/", import.meta.url);

function lyricsHref(genre, track) {
  const query = new URLSearchParams({ genre: genre.id });
  if (track) query.set("track", track.id);
  return `?${query}`;
}

function appendPathLink(label, href) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = href;
  path.append(link);
  path.hidden = false;
}

function setPageTitle(title, subtitle) {
  heading.textContent = title;
  description.textContent = subtitle ?? "";
  description.hidden = !subtitle;
  document.title = `${title} · Lyrics · Klein's Blog`;
  document.querySelector('.nav [aria-current="page"]').removeAttribute("aria-current");
}

function trackCount(genre) {
  const count = genre.tracks.length;
  return `${count} ${count === 1 ? "track" : "tracks"}`;
}

function buildTrackGrid(genre, tracks) {
  const grid = document.createElement("ul");
  grid.className = "lyrics-grid";
  tracks.forEach((track) => {
    const card = document.querySelector("#lyrics-card").content.cloneNode(true);
    card.querySelector("a").href = lyricsHref(genre, track);
    card.querySelector("img").src = new URL(track.image, coversUrl).href;
    card.querySelector(".lyrics-card-title").textContent = track.title;
    const caption = card.querySelector(".lyrics-card-caption");
    if (track.caption) {
      caption.textContent = track.caption;
    } else {
      caption.remove();
    }
    grid.append(card);
  });
  return grid;
}

function renderOverview() {
  genres.forEach((genre) => {
    const section = document.querySelector("#lyrics-genre").content.cloneNode(true);
    section.querySelector("h2").textContent = genre.title;
    const viewAll = section.querySelector("a");
    viewAll.href = lyricsHref(genre);
    viewAll.setAttribute("aria-label", `View all ${genre.title} tracks (${trackCount(genre)})`);
    section.querySelector("section").append(buildTrackGrid(genre, genre.tracks.slice(0, previewCount)));
    content.append(section);
  });
}

function renderGenre(genre) {
  appendPathLink("← Lyrics", "./");
  setPageTitle(genre.title, `${genre.description} · ${trackCount(genre)}`);
  content.append(buildTrackGrid(genre, genre.tracks));
}

function renderTrack(genre, track) {
  appendPathLink("← Lyrics", "./");
  appendPathLink(genre.title, lyricsHref(genre));
  setPageTitle(track.title, track.caption);

  const entry = document.querySelector("#lyrics-entry").content.cloneNode(true);
  const image = entry.querySelector("img");
  image.src = new URL(track.image, coversUrl).href;
  image.alt = track.alt;
  if (track.excerpt) {
    entry.querySelector("blockquote").textContent = track.excerpt;
  } else {
    entry.querySelector(".lyrics-excerpt").remove();
  }
  const note = entry.querySelector(".lyrics-note");
  if (track.note) {
    note.querySelector("p").textContent = track.note;
  } else {
    note.remove();
  }
  content.append(entry);
}

const genre = genres.find((item) => item.id === genreId);
const track = genre?.tracks.find((item) => item.id === trackId);

if (genreId === null && trackId === null) {
  renderOverview();
} else if (track) {
  renderTrack(genre, track);
} else if (genre && trackId === null) {
  renderGenre(genre);
} else {
  appendPathLink("← Lyrics", "./");
  setPageTitle("Page unavailable", "This genre or track could not be found.");
}
