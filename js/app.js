/**
 * Created by vadym on 23.09.15.
 */
var products = [];
var searchInput = $('.search');

var template = Handlebars.compile($('#mainTemplate').html());

$(document).ready(function () {
    $.get('http://localhost:3000/products', function (data) {
        products = data;
        renderProductsUI()
    })
});

function renderProductsUI() {
    var htmlString = template({products:products});
    $('#products-manager').html(htmlString);
    var lis = $('.productsListItem');

    lis.find('.deleteBtn').on('click', function () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        $.post('http://localhost:3000/products/'+product.id+'/delete', function () {
            products.splice(li.attr('data-index'), 1);
            renderProductsUI();
        })
    });

    lis.find(".editBtn").on("click", function () {
        var li = $(this).parent();
        li.find(".editBtn").hide();
        li.find(".editInput").show();
        li.find(".cancelBtn").show();
        li.find(".okayBtn").show();
    });

    lis.find(".cancelBtn").on("click", function () {
        var li = $(this).parent();
        var input = li.find(".editInput");
        input.val("");
        input.hide();
        li.find(".cancelBtn").hide();
        li.find(".okayBtn").hide();
        li.find(".editBtn").show();
    });

    lis.find(".okayBtn").on("click", function () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        var input = li.find(".editInput");
        $.post('http://localhost:3000/products/'+product.id+'/edit', { editedProduct: input.val() }, function () {
                product.name = input.val();
                renderProductsUI();
        });
    });
    $('.addProduct').on('click',function () {
        var product = $('.productsInput').val();
        $.post('http://localhost:3000/products/add', { newProduct: product }, function (data) {
            products.push({id:data, name:product});
            renderProductsUI();
        });
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
    if (e.keyCode === 13) searchAndRender()
});

searchInput.on('input', setTimeout.bind(null, searchAndRender, 1000));

$('.searchBtn').on('click', searchAndRender);