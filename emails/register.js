const keys = require('../keys')

module.exports = function (email) {
    return {
        to: email,
        from: 'Course shop <testmailer2000@mail.ru>',
        subject: 'Вы успешно зарегистрированы',
        text: 'Вы успшно зарагистрированы на сайте shop course',
        html: `
            <h1>Аккаунт создан</h1>
            <h3>Добро пожаловать в нашем магазине курсов</h3>
            <p>ваш email: ${email}</p>
            <hr>
            <a href="${keys.BASE_URL}">перейти на сайт</a>
        `
    }
}

/* 
    Dvor1234
    dvorovoy98
 */