function toCurrency(price){
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(+price);
}

function toDate(date){
  return new Intl.DateTimeFormat('ru-Ru', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
}

document.querySelectorAll('.date').forEach((node)=>{
  node.textContent = toDate(node.textContent);
});

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(+node.textContent);
})

const $card =  document.querySelector('#card');

if($card){
  let csrfKey = null;
  $card.addEventListener('click', (e)=>{
    const target = e.target;

    if(target.classList.contains('js-remove')){
      const {id, key} = target.dataset;
      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrfKey? csrfKey : key
        }
        // body: JSON.stringify({
        //   _csrf: key
        // })
      }).then(response=> response.json() )
        .then(data=>{
          csrfKey = data.csrf
          
          if(data.cart.courses.length){
            const HTML = data.cart.courses.map( ({title, count, id, price}, idx) =>{
              return `
                  <tr>
                    <td>${title}</td>
                    <td>${count}</td>
                    <td>${price}</td>
                    <td>
                        <button class="btn btn-small js-remove" data-id="${id}">Удалить</button>
                    </td>
                  </tr>
              `
            }).join('');
            $card.querySelector('tbody').innerHTML = HTML;
            $card.querySelector('.price').textContent = toCurrency(data.cart.price);
          }else{
            $card.innerHTML = `<p>Корзина пуста</p>`;
          }
        }).catch((err)=>{
          alert(`${err.name} ${err.message}`)
          throw err;
        });

    }
    
  });
}

M.Tabs.init(window.document.querySelector('.tabs'), {
  
});