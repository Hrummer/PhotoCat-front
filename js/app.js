/**
 * Created by vadym on 23.09.15.
 */
var products = [];
var searchInput = $('.search');

var template = Handlebars.compile($('#mainTemplate').html());

$(document).ready(function () {
    $.get('http://46.101.216.31:3000/products', function (data) {
        products = data;
        renderProductsUI();
    })
});

function renderProductsUI() {
    var htmlString = template({products:products});
    $('#products-manager').html(htmlString);
    var lis = $('.productsListItem');

    lis.find('.deleteBtn').on('click', function () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        $.post('http://46.101.216.31:3000/products/'+product.id+'/delete', function () {
            products.splice(li.attr('data-index'), 1);
            renderProductsUI();
        });
    });

    lis.find('.editBtn').on('click', function () {
        var li = $(this).parent();
        li.find('.editBtn').hide();
        li.find('.editInput').show();
        li.find('.cancelBtn').show();
        li.find('.okayBtn').show();
    });

    lis.find('.cancelBtn').on('click', function () {
        var li = $(this).parent();
        var input = li.find('.editInput');
        input.val('');
        input.hide();
        li.find('.cancelBtn').hide();
        li.find('.okayBtn').hide();
        li.find('.editBtn').show();
    });

    lis.find('.editInput').on('input', function () {
        var input = $(this);
        var li = $(this).parent();
        if (input.val().length > 30) li.find('.warn').show();
        else li.find('.warn').hide();

    });

    function editingProduct () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        var input = li.find('.editInput');
        if (input.val().length > 30 || input.val().length === 0) return;
        else {
            $.post('http://46.101.216.31:3000/products/'+product.id+'/edit', { editedProduct: input.val() }, function () {
                product.name = input.val();
                renderProductsUI();
            });
        }
    }

    lis.find('.editInput').on('keyup', function (e) {
        if (e.keyCode === 13) {
            var li = $(this).parent();
            var input = li.find('.editInput');
            if (input.val().length === 0) {
              li.find('.emptyWarn').show();
              setTimeout(function () {
                  li.find('.emptyWarn').hide()
              }, 3000);
            }
            else editingProduct.call(this);
        }
    });

    lis.find('.okayBtn').on('click', function () {
        var li = $(this).parent();
        var input = li.find('.editInput');
        if (input.val().length === 0) {
            li.find('.emptyWarn').show();
            setTimeout(function () {
                li.find('.emptyWarn').hide()
            }, 3000);
        }
        else editingProduct.call(this);
    });

    var productsInput = $('.productsInput');

    function addProduct () {
        var product = productsInput.val();
        if (product.length > 30 || product.length === 0) return;
        else{
            $.post('http://46.101.216.31:3000/products/add', { newProduct: product }, function (data) {
                products.push({id:data, name:product});
                renderProductsUI();
            });
        }
    }

    productsInput.on('input', function () {
        if (productsInput.val().length > 30) {
            $('.addingWarn').show();
        }
        else $('.addingWarn').hide();
    });

    productsInput.on('keyup', function (e) {
        if (e.keyCode === 13) {
            if (productsInput.val().length === 0) {
                var warn = $('.addingEmptyWarn');
                warn.show();
                setTimeout(function () {
                    warn.hide();
                }, 3000)
            }
            else addProduct();
        }
    });

    $('.addProduct').on('click', function () {
        if (productsInput.val().length === 0) {
            var warn = $('.addingEmptyWarn');
            warn.show();
            setTimeout(function () {
                warn.hide();
            }, 3000)
        }
        else addProduct();
    });
}

function search (arrayOfObjects, value) {
    return arrayOfObjects.filter(function (product) {
        return product.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    })
}

function searchAndRender () {
    var cachedProducts = products;
    products = search(products, searchInput.val());
    renderProductsUI();
    products = cachedProducts;
}

searchInput.on('keyup', function (e) {
    if (e.keyCode === 13) searchAndRender();
});

function notFrequentThan (func, delay) {
    var calls = 0;
    return function () {
        var args = Array.prototype.slice.call(arguments);
        var self = this;
        calls++;
        setTimeout(function () {
            calls--;
            if (calls === 0) func.apply(self,args);
        },delay);
    }
}

var delayedSearchAndRender = notFrequentThan(searchAndRender, 500);

searchInput.on('input', delayedSearchAndRender);

$('.searchBtn').on('click', searchAndRender);