console.log(data);

const now = new Date();
const STARTDATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());

dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayDivs = dayNames.map(dayName => `<div class='calendar-element dayName'>${dayName}</div>`)

class calendarElement {
    static fromJSON(jsonElem) {
        const result = calendarElement.properSubclass(jsonElem.type);
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
            default:
                console.log(type);
                return new calendarElement();
        }
    }

    get isDisabled(){
        return this.calendarDate < STARTDATE;
    }

    cssClasses() {
        return [
            "calendar-element",
            this.isDisabled ? "disabled" : ""
        ]
    }

    get classList() {
        return "'" + this.cssClasses().join(" ") + "'";
    }

    background(){
        return this.img ? `background-image:url(${this.img})` : `background-color:#c00`;
    }

    get previewStyle(){
        return "'" +
        [
            this.background(),
            this.img_pos_y ? `background-position-y:${this.img_pos_y}` : '',
            this.img_pos_x ? `background-position-x:${this.img_pos_x}` : '',
            this.full_width === "TRUE" ? `background-size:auto 100%` : '',
        ].join(";")
        +"'"
    }

    renderPreview() {
        return `
        <div class=${this.classList} style=${this.previewStyle}  onclick='showModal(${this.date})'>
            <span class='date'>${this.date}</span>    
        
        </div>`
        //<h1>${this.title}</h1>
    }

    renderDetail(){
        return `
        <div class=${this.classList}>
            <img src=${this.img} />
            <div class="info">
                <h1>${this.title}</h1>
                <span class="synopsis">${this.synopsis}</span>
                <div class='linksSection'>
                    ${this.links.map(calendarElement.createLinkButton)}
                </div>
            </div>
        </div>`
    }

    static createLinkButton(link){
        if(!link){
            return '<button disabled>No Streaming Link Available</button>';
        }
        const streamingProvider = calendarElement.determineStreamingProvider(link)
        const buttonText = "Watch" + (streamingProvider.length > 0 ? ` on ${streamingProvider}` : ``);
        return `
        <a href=${link}>
            <button class=${streamingProvider.replace(/ /g, "_")}>${buttonText}</button>
        </a>`
    }

    static determineStreamingProvider(link){
        const urlRegex = /(http|https)(:\/\/)(www.)?(.+)(.com\/)(.+)/;
        const matches = link.match(urlRegex);
        const domain = matches[4];
        switch(domain.toUpperCase()) {
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
            default:
                console.log(matches);
                return "";
        }

    }
}

class TVEpisode extends calendarElement {
    cssClasses() {
        return [
            ...super.cssClasses(),
            "tv-episode"
        ];
    }

    renderDetail(){
        return `
        <div class=${this.classList}>
            <img src=${this.img} />
            <div class="info">
                <h1>${this.title}</h1>
                <h3> ${this.tv_info.series} Season ${this.tv_info.season}, Episode ${this.tv_info.episode} </h3>
                <span class="synopsis">${this.synopsis}</span>
                <div class='linksSection'>
                    ${this.links.map(calendarElement.createLinkButton)}
                </div>
            </div>
        </div>`
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

function hideModal(e){
    const detail = document.getElementById('calendarElement-detail');
    if(detail.classList && [...detail.classList.values()].find(className => className === "shown")){
        detail.classList.remove("shown");
    }
}

function showModal(date){
    console.log(date);
    console.log(calendarElems.length);
    const detailElem = calendarElems.find(calendarElem => calendarElem.date == date);
    document.getElementById('detail-content').innerHTML = detailElem.renderDetail();
    const detailContainer = document.getElementById('calendarElement-detail');
    if(detailContainer.classList && !detailContainer.classList.contains('shown')){
        detailContainer.classList.add('shown');
    }
}

calendarElems = data.map(calendarElement.fromJSON)
console.log(calendarElems);
const previews = calendarElems.map(elem => elem.renderPreview())
document.getElementById('calendar-preview').innerHTML = dayDivs.join(" ") + previews.join(" ");