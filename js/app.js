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
        var warns = [li.find('.emptyWarn'), li.find('.duplicateWarn'), li.find('.specialCharactersWarn')];
        warns.forEach(function (item) {
            item.hide();
        });
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
        var warns = [li.find('.emptyWarn'), li.find('.duplicateWarn'), li.find('.specialCharactersWarn')];
        warns.forEach(function (item) {
            item.hide();
        });
        var warn = li.find('.warn');
        (inputValue.length > 30) ? warn.show() : warn.hide();
    });

    function removeSpaces (value) {
        return value.trim().replace(/\s{2,}/, " ");
    }

    function hasSpecialCharacters (value) {
        return /[^а-яА-ЯёЁa-zA-Z0-9\s]+?/.test(value);
    }

    function editFieldValidation () {
        var li = $(this).parent();
        var input = li.find('.editInput');
        var editedProduct = removeSpaces(input.val());
        if (editedProduct.length === 0) {
            var warn = li.find('.emptyWarn');
            input.val('');
            warn.show();
        }
        else if (input.val().length > 30) return;
        else if (hasSpecialCharacters(editedProduct)) {
            var warn = li.find('.specialCharactersWarn');
            warn.show();
        }
        else if (products.indexOf(editedProduct) !== -1) {
            var warn = li.find('.duplicateWarn');
            warn.show();
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
        var warns = [$('.addingEmptyWarn'), $('.addingSpecialCharactersWarn'), $('.addingDuplicateWarn')];
        warns.forEach(function (item) {
          item.hide();
        })
         (productsInput.val().length > 30) ? warn.show() : warn.hide();
    });

    function addFieldValidation () {
        var newProduct = removeSpaces(productsInput.val());
        console.log(newProduct);
        if (newProduct.length === 0) {
            productsInput.val('');
            var warn = $('.addingEmptyWarn');
            warn.show();
        }
        else if (productsInput.val().length > 30) return;
        else if (hasSpecialCharacters(newProduct)) {
            var warn = $('.addingSpecialCharactersWarn');
            warn.show();
        }
        else if (products.indexOf(newProduct) !== -1) {
            var warn = $('.addingDuplicateWarn');
            warn.show();
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