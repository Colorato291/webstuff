const competitions = [
    {
        title: "Bizness 24h",
        description: "Largest annual educational entrepreneurship contest in Latvia. Won 2nd place by creating a business plan focusing on creating design-oriented computers and by running a successful marketing campaign for a driving school.",
        link: "https://bizness24h.lv/home/",
        image: "./img/bizness24h.png"
    },
    {
        title: "IMC Prosperity",
        description: "IMC's global trading challenge. Created a trading algorithm in Python that fit in a specific framework.",
        link: "https://www.imc.com/eu/corporate-news/prosperity-3-IMCs-global-trading-challenge-returns",
        image: "https://cdn.sanity.io/images/l1io23s3/production/0b1c6b2032c3f7d49191123bc6d0f7b0e4765756-2400x1260.png?w=1200&h=630"

    },
    {
        title: "Martina-CTF",
        description: "A Jeopardy style Capture The Flag competition. Had notable success in data recovery, cryptography and stenography tasks.",
        link: "https://mctf.datoriki.org/2024/index",
        image: "./img/MCTF_logo.svg"
    }
];

function renderCompetitions() {
    const container = document.getElementById('competition-sections');
    container.innerHTML = "";

    competitions.forEach(comp => {
        const wrapper = document.createElement(comp.link ? 'a' : 'div');
        if (comp.link) wrapper.href = comp.link;
        wrapper.className = "competition-item";
        if (comp.image) wrapper.style.backgroundImage = `url('${comp.image}')`;

        const title = document.createElement('p');
        title.className = "title";
        title.textContent = comp.title;

        const desc = document.createElement('p');
        desc.className = "description";
        desc.textContent = comp.description;

        wrapper.appendChild(title);
        wrapper.appendChild(desc);
        container.appendChild(wrapper);
    });
}