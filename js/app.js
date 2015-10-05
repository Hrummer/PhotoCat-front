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

    function editingProduct () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        var editedProduct = li.find('.editInput').val().trim();

        $.post('http://46.101.216.31:3000/products/'+product.id+'/edit', { editedProduct: editedProduct }, function () {
            product.name = editedProduct;
            renderProductsUI();
        });
    }

    lis.find('.editInput').on('input', function () {
        var inputValue = $(this).val();
        var li = $(this).parent();
        var warn = li.find('.warn');
        (inputValue.length > 30) ? warn.show() : warn.hide();

    });

    function editFieldValidation () {
        var li = $(this).parent();
        var input = li.find('.editInput');
        var editedProduct = li.find('.editInput').val().trim();
        if (editedProduct.length === 0) {
            var warn = li.find('.emptyWarn');
            input.val('');
            warn.show();
            setTimeout(function () {
                warn.hide()
            }, 3000);
        }
        else if (input.val().length > 30) return;
        else if (search(products, editedProduct).length) {
            var warn = li.find('.duplicateWarn');
            warn.show();
            setTimeout(function () {
                warn.hide();
            }, 3000)
        }
        else editingProduct.call(this);
    }

    lis.find('.editInput').on('keyup', function (e) {
        if (e.keyCode === 13) {
            editFieldValidation.call(this);
        }
    });

    lis.find('.okayBtn').on('click', function () {
      editFieldValidation.call(this);
    });

    var productsInput = $('.productsInput');

    function addProduct () {
        var product = productsInput.val().trim();
        $.post('http://46.101.216.31:3000/products/add', { newProduct: product }, function (data) {
            products.push({id:data, name:product});
            renderProductsUI();
        });
    }

    productsInput.on('input', function () {
        var warn = $('.addingWarn');
         (productsInput.val().length > 30) ? warn.show() : warn.hide();
    });

    function addFieldValidation () {
        var newProduct = productsInput.val().trim();
        if (newProduct.length === 0) {
            productsInput.val('');
            var warn = $('.addingEmptyWarn');
            warn.show();
            setTimeout(function () {
                warn.hide();
            }, 3000);
        }
        else  if (productsInput.val() > 30) return;
        else  if (search(products, newProduct).length) {
            var warn = $('.addingDuplicateWarn');
            warn.show();
            setTimeout(function () {
                warn.hide()
            }, 3000);
        }
        else addProduct();
    }

    productsInput.on('keyup', function (e) {
        if (e.keyCode === 13) addFieldValidation();
    });

    $('.addProduct').on('click', function () {
        addFieldValidation();
    });
}

function search (arrayOfObjects, value) {
    return arrayOfObjects.filter(function (product) {
        return product.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    });
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