console.log(data);

const now = new Date();
const STARTDATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());

dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayDivs = dayNames.map(dayName => `<div class='calendar-element dayName'>${dayName}</div>`)


class calendarAux{
    static fromJSON(jsonElem) {
        const result = calendarAux.properSubclass(jsonElem.type);
        Object.keys(jsonElem).forEach(key => result[key] = jsonElem[key]);
        result.calendarDate = new Date(2019, 11, result.date);
        return result;
    }

    static properSubclass(type) {
        switch (type) {
            case "MOVIE":
                return new Movie();
            case "TV":
                return new TVEpisode();
            case "PODCAST":
                return new PodcastEpisode();
            default:
                console.log(type);
                return new calendarElement();
        }
    }

    static determineStreamingProvider(link) {
        const urlRegex = /(http|https)(:\/\/)(www.)?(.+)(.com\/|.org\/|.net\/)(.+)/;
        const matches = link.match(urlRegex);
        const domain = matches[4];
        switch (domain.toUpperCase()) {
            case "AMAZON":
                return "Amazon";
            case "DAILYMOTION":
                return "Daily Motion"
            case "DISNEYPLUS":
                return "Disney Plus";
            case "HULU":
                return "Hulu";
            case "NETFLIX":
                return "Netflix";
            case "PLAY.HBOGO":
                return "HBO";
            case "PODCASTS.APPLE":
                return "Apple Podcasts";
            case "SONYCRACKLE":
                return "Crackle";
            case "YOUTUBE":
                return "Youtube";
            case "ARCHIVE":
                return "Archive.org"
            default:
                console.log(matches);
                return "";
        }
    }

    static runtime(timeInMinutes){
        if(timeInMinutes < 60){
            return `${timeInMinutes} minutes`
        } else{
            const hours = Math.floor(timeInMinutes / 60);
            const minutes = (timeInMinutes % 60);
            return `${hours} hours ${minutes} minutes`
        }
    }

    static convertDate(daysSince1900){
        const date = new Date(1900, 0, daysSince1900);
        const [year, month, day] = [date.getFullYear(), date.getMonth() + 1, date.getDate() - 1]
        return [month,day,year].join("/");
    }
}


class calendarElement {
    get isDisabled() {
        return this.calendarDate < STARTDATE;
    }

    get classList() {
        return "'" + this.cssClasses().join(" ") + "'";
    }

    cssClasses() {
        return [
            "calendar-element",
            this.isDisabled ? "disabled" : ""
        ]
    }

    background() {
        return this.img ? `background-image:url(${this.img})` : `background-color:#c00`;
    }

    get previewStyle() {
        return "'" +
            [
                this.background(),
                this.img_pos_y ? `background-position-y:${this.img_pos_y}` : '',
                this.img_pos_x ? `background-position-x:${this.img_pos_x}` : '',
                this.full_width === "TRUE" ? `background-size:auto 100%` : '',
            ].filter(inlineStyle => inlineStyle.length > 0)
            .join(";")
            + "'"
    }

    renderPreview() {
        return `
        <div class=${this.classList} style=${this.previewStyle}  onclick='showModal(${this.date})'>
            <span class='date'>${this.formatted_date}</span> 
            <span class='weekday'>${this.weekday}</span>   
        </div>`
    }

    header(){
        return `<h1>${this.title}</h1>`;
    }

    renderDetail() {
        return `
        <div class=${this.classList}>
            <img src="${this.img}" />
            <div class="info">
                <div class="header">
                    ${this.header()}
                </div>
                <span class="synopsis">${this.synopsis}</span>
                <div class="linksSection">
                    ${this.links.map(link => this.createLinkButton(link))}
                </div>
                <br>
                <div class="extraInfo">
                    <p> Released: ${calendarAux.convertDate(this.release_date)} </p>
                    <p> Runtime: ${calendarAux.runtime(this.runtime)} </p>
                    <p> <a href="${this.imdb}">More info on IMDB</a> </p>
                </div>
                <br>
            </div>
        </div>`
    }

    buttonVerb(){
        return 'Watch';
    }

    createLinkButton(link) {
        if (!link) {
            return '<button disabled>No Streaming Link Available</button>';
        }
        const streamingProvider = calendarAux.determineStreamingProvider(link)
        const streamingClass = streamingProvider.replace(/ /g, "_")
        const buttonText = this.buttonVerb() + (streamingProvider.length > 0 ? ` on ${streamingProvider}` : ``);
        return `
        <a href="${link}">
            <button class="${streamingClass}">${buttonText}</button>
        </a>`
    }
}

class TVEpisode extends calendarElement {
    cssClasses() {
        return [
            ...super.cssClasses(),
            "tv-episode"
        ];
    }

    header(){
        return `
            <h1>${this.title}</h1>
            <h3> ${this.tv_info.series} Season ${this.tv_info.season}, Episode ${this.tv_info.episode} </h3>
        `
    }
}

class Movie extends calendarElement {
    cssClasses() {
        return [
            ...super.cssClasses(),
            "movie"
        ];
    }
}

class PodcastEpisode extends calendarElement {
    cssClasses() {
        return [
            ...super.cssClasses(),
            "podcast"
        ];
    }

    buttonVerb(){
        return 'Listen';
    }
}

function hideModal(e) {
    const detailContainer = document.getElementById('calendarElement-detail');
    if (detailContainer.classList && [...detailContainer.classList.values()].find(className => className === "shown")) {
        detailContainer.classList.remove("shown");
    }
}

function showModal(date) {
    const detailElem = calendarElems.find(calendarElem => calendarElem.date == date);
    const detailContent = document.getElementById('detail-content');
    const detailContainer = document.getElementById('calendarElement-detail');

    detailContent.innerHTML = detailElem.renderDetail();
    detailContainer.classList.add('shown');
}

calendarElems = data.map(calendarAux.fromJSON)
console.log(calendarElems);
const previews = calendarElems.map(elem => elem.renderPreview())
document.getElementById('calendar-preview').innerHTML = dayDivs.join(" ") + previews.join(" ");

const renderedcalendarElems = document.getElementsByClassName('calendar-element');
if(window.innerWidth < 600){
    renderedcalendarElems.item(7 + new Date().getDate() - 1).scrollIntoView();
    window.scrollBy(0,-160);
}
console.log(renderedcalendarElems);