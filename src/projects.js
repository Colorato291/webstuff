const projects = [
    {
        title: "This page",
        description: "Well you're looking at it...",
        image: "./img/Cool_cat.jpg"
    },
    {
        title: "Carsharing comparison",
        description: "A useful tool to compare carsharing prices between CityBee, Bolt, Carguru and others.",
        link: "https://www.coolcat-dev.com/cars/"
    },
    {
        title: "AutoTev.lv",
        description: "Car rental platform prototype for a university project. Left unfinished due to sudden course timeline changes.",
        link: "https://github.com/elinazeberga/PIT_webPage/tree/master"
    },
    {
        title: "LZMA Compression algorithm",
        description: "Java implementation of an LZMA compression algorithm for a university project."
    },
    {
        title: "Maze generation and solving",
        description: "Java implementation of a maze generation and multiple solver algorithms for a university project."
    },
    {
        title: "Dota Amplified",
        description: "A custom game mode for Dota2 where each hero’s core stereotypes are dramatically exaggerated, creating over-the-top abilities and playstyles.",
        image: "./img/mirana.jpeg"
    },
    {
        title: "Dots",
        description: "(WIP) A fun little page. Inspired by Nothing's dotted typeface.",
        link: "https://www.coolcat-dev.com/dots/",
        image: "./img/nothing_dot.jpg"
    },
    {
        title: "Automated parking lot prototype",
        description: "A multi-container cloud-native application using Docker Compose, integrating services such as MongoDB, RabbitMQ, MinIO, Node.js, Nginx, Mailhog, and OpenALPR.",
        link: "https://github.com/Colorato291/CloudComputingProject"
    }
];

function renderProjects() {
    const container = document.getElementById('project-sections');
    container.innerHTML = "";

    projects.forEach(proj => {
        const wrapper = document.createElement(proj.link ? 'a' : 'div');
        if (proj.link) wrapper.href = proj.link;
        wrapper.className = "project-item";
        if (proj.image) {
            wrapper.style.backgroundImage = `url('${proj.image}')`;
        }

        const title = document.createElement('p');
        title.className = "title";
        title.textContent = proj.title;

        const desc = document.createElement('p');
        desc.className = "description";
        desc.textContent = proj.description;

        wrapper.appendChild(title);
        wrapper.appendChild(desc);
        container.appendChild(wrapper);
    });
}