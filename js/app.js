/**
 * Created by vadym on 23.09.15.
 */
var products = [];

var tml = Handlebars.compile($('#mainTemplate').html());

$(document).ready(function () {
    $.get('http://localhost:3000/products', function (data) {
        products = data;
        renderProductsUI()
    })
});


function add(product, index, id){
    var li = $('');

    li.find('.deleteBtn').on('click', function () {
        $.post('http://localhost:3000/products/'+id+'/delete', function (err, data) {
            if (!err && !!data) {
                products.splice(index, 1);
                renderProductsUI();
            }
        })
    });

    li.find(".editBtn").on("click", function () {
        li.find(".editBtn").hide();
        li.find(".editInput").show();
        li.find(".cancelBtn").show();
        li.find(".okayBtn").show();
    });

    li.find(".cancelBtn").on("click", function () {
        var input = li.find(".editInput");
        input.val("");
        input.hide();
        li.find(".cancelBtn").hide();
        li.find(".okayBtn").hide();
        li.find(".editBtn").show();
    });

    li.find(".okayBtn").on("click", function () {
        var input = li.find(".editInput");
        $.post('http://localhost:3000/products/'+id+'/edit', { editedProduct: input.val() }, function (err, data) {
            if (!err && !!data) {
                products[index].name = input.val();
                renderProductsUI();
            }
        })
    });
}

function renderProductsUI() {
    var html_string = tml({products:products});
    var html = $(html_string);
    $('#main').html(html);
    var lis = $('.productsListItem');

    lis.find('.deleteBtn').on('click', function () {
        var li = $(this).parent();
        var product = products[li.attr('data-index')];
        $.post('http://localhost:3000/products/'+product.id+'/delete', function (err, data) {
            if (!err && !!data) {
                products.splice(li.attr('data-index'), 1);
                renderProductsUI();
            }
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
        $.post('http://localhost:3000/products/'+product.id+'/edit', { editedProduct: input.val() }, function (err, data) {
            if (!err && !!data) {
                product.name = input.val();
                renderProductsUI();
            }
        });
    });
    $('.addProduct').on('click',function () {
        var product = $('.productsInput').val();
        $.post('http://localhost:3000/products/add', { newProduct: product }, function (err, data) {
            products.push({id:data, name:product});
            renderProductsUI();
        });
    });
}