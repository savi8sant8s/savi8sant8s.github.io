var app = new Vue({
    el: '#app',
    data: {
        year: new Date().getFullYear(),
        currentLanguage: 'pt',
        isLoaded: false,
        translations: {
            pt: {
                title: 'Sávio Santos',
                subtitle: 'Engenheiro de Software, Mestre em Engenharia da Computação, com experiência em desenvolvimento frontend, mobile e backend, especialmente nas tecnologias Vue.js, Next.js, Express e Nest.js. Atualmente atuando em P&D com Inteligência Artificial, focado em visão computacional e modelos de linguagem.',
                footer: 'Todos os direitos reservados.',
                switchLanguage: 'Alterar idioma'
            },
            en: {
                title: 'Sávio Santos',
                subtitle: 'Software Engineer, Master in Computer Engineering, with experience in frontend, mobile, and backend development, especially in Vue.js, Next.js, Express, and Nest.js technologies. Currently working in R&D with Artificial Intelligence, focused on computer vision and language models.',
                footer: 'All rights reserved.',
                switchLanguage: 'Switch language'
            }
        },
        contacts: [
            {
                id: 'email',
                title: 'E-mail',
                value: 'savi8sant8s@gmail.com',
                link: 'mailto:savi8sant8s@gmail.com',
                icon: 'fas fa-envelope'
            },
            {
                id: 'github',
                title: 'Github',
                value: 'github.com/savi8sant8s',
                link: 'https://github.com/savi8sant8s',
                icon: 'fab fa-github'
            },
            {
                id: 'linkedin',
                title: 'LinkedIn',
                value: 'linkedin.com/in/savi8sant8s',
                link: 'https://linkedin.com/in/savi8sant8s',
                icon: 'fab fa-linkedin'
            },
            {
                id: 'orcid',
                title: 'ORCID',
                value: '0000-0002-4707-6948',
                link: 'https://orcid.org/0000-0002-4707-6948',
                icon: 'fab fa-orcid'
            },
            {
                id: 'prancheta_apps',
                title: 'Prancheta Apps',
                value: 'play.google.com/prancheta-apps',
                link: 'https://play.google.com/store/apps/dev?id=7964185345858453468',
                icon: 'fab fa-google-play'
            },
            {
                id: 'cv_lattes',
                title: 'Lattes',
                value: 'https://lattes.cnpq.br/3364432948507529',
                link: 'https://lattes.cnpq.br/3364432948507529',
                icon: 'fas fa-file-alt'
            }
        ]
    },
    computed: {
        pageTitle() {
            return this.translations[this.currentLanguage].title;
        },
        pageDescription() {
            return this.translations[this.currentLanguage].subtitle;
        }
    },
    methods: {
        toggleLanguage() {
            this.currentLanguage = this.currentLanguage === 'pt' ? 'en' : 'pt';
            localStorage.setItem('preferredLanguage', this.currentLanguage);
            document.documentElement.lang = this.currentLanguage === 'pt' ? 'pt-BR' : 'en';
        },
        initializeLanguage() {
            const savedLang = localStorage.getItem('preferredLanguage');
            const browserLang = navigator.language || navigator.userLanguage;
            
            if (savedLang) {
                this.currentLanguage = savedLang;
            } else if (browserLang.startsWith('en')) {
                this.currentLanguage = 'en';
            } else {
                this.currentLanguage = 'pt';
            }
            
            document.documentElement.lang = this.currentLanguage === 'pt' ? 'pt-BR' : 'en';
        }
    },
    mounted() {
        this.initializeLanguage();
        setTimeout(() => {
            this.isLoaded = true;
        }, 100);
    }
});
