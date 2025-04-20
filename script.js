var app = new Vue({
    el: '#app',
    data: {
        year: new Date().getFullYear(),
        showInternships: false,
        darkMode: false,
        title: 'Sávio Santos',
        subtitle: 'Engenheiro de Software, mestrando em Engenharia da Computação, com experiência em desenvolvimento frontend, mobile e backend, especialmente nas tecnologias Vue.js, Next.js, Express e Nest.js. Atualmente atuando em P&D com Inteligência Artificial, focado em visão computacional e modelos de linguagem.',
        works: [
            {
                id: 'di2win-1',
                title: 'Engenheiro de Software P&D Junior',
                company: 'Di2Win',
                time: 'Dez. 2024 - Presente',
                current: true
            },
            {
                id: 'comeia-2',
                title: 'Desenvolvedor Frontend Pleno',
                company: 'Comeia Labs',
                time: 'Jul. 2024 - Nov. 2024',
            },
            {
                id: 'show-1',
                title: 'Analisa de Software Pleno',
                company: 'Show Tecnologia',
                time: 'Mai. 2023 - Jun. 2024',
            },
            {
                id: 'comeia-1',
                title: 'Desenvolvedor Frontend Junior',
                company: 'Comeia Labs',
                time: 'Jan. 2023 - Dez. 2023',
            }
        ],
        internships: [
            {
                id: 'inclusivepet',
                title: 'Desenvolvedor Full Stack Bolsista',
                company: 'Lótus de Inovação Garanhuns',
                time: 'Fev. 2023 - Set. 2023',
            },
            {
                id: 'prexis',
                title: 'Desenvolvedor Blockchain Frontend Bolsista',
                company: 'Prëxis Labs',
                time: 'Fev. 2023 - Abr. 2023',
            },
            {
                id: 'upe',
                title: 'Desenvolvedor Fullstack e Mobile Bolsista',
                company: 'Universidade de Pernambuco',
                time: 'Jul. 2020 - Dez. 2021',
            },
            {
                id: 'amstt',
                title: 'Desenvolvedor Mobile Estágio',
                company: 'AMSTT - Universidade de Pernambuco',
                time: 'Mar. 2020 - Dez. 2021',
            }
        ],
        projects: [
            {
                id: 'poupemais',
                title: 'Poupe Mais',
                logo: 'https://play-lh.googleusercontent.com/lT2mcFsX-NnYOBouwnIWCrnqlOhHO5wvwxr9zF-BHjgXFBPH5tID4g6MejLMd5IVYjA=w240-h480-rw',
                description: 'Atuo como dev. Backend na solução, além de cuidar de toda a arquitetura, serviços e coordenação da equipe.',
                link: 'https://poupemais.app'
            },
            {
                id: 'quadrotatico',
                title: 'Quadro Tático de Esportes',
                logo: 'https://play-lh.googleusercontent.com/pEgNGZah82kFq3yjoamLSx4DRgUoqi3HKA5t0GK7NMV-r5De_AaS0nHJkRBqLOTtB1U=s256-rw',
                description: 'Trabalho pessoal, onde desenvolvi um quadro tático útil para diversos esportes, como futebol, basquete e outros.',
                link: 'https://play.google.com/store/apps/details?id=com.prancheta.quadrotaticodeesportes'
            }
        ],
        contacts: [
            {
                id: 'email',
                title: 'E-mail para contato',
                value: 'savi8sant8s@gmail.com',
                link: 'mailto:savi8sant8s@gmail.com'
            },
            {
                id: 'github',
                title: 'Confira meus projetos no Github',
                value: 'github.com/savi8sant8s',
                link: 'https://github.com/savi8sant8s'
            },
            {
                id: 'linkedin',
                title: 'Informações profissionais em detalhes no Linkedin',
                value: 'linkedin.com/in/savi8sant8s',
                link: 'https://linkedin.com/in/savi8sant8s'
            },
            {
                id: 'orcid',
                title: 'Artigos publicados e que eu colaborei (ORCID)',
                value: '0000-0002-4707-6948',
                link: 'https://orcid.org/0000-0002-4707-6948'
            }
        ]
    },
    methods: {
        toggleInternships() {
            this.showInternships = !this.showInternships;
        },
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            document.body.classList.toggle('dark-mode', this.darkMode);
        }
    },
});