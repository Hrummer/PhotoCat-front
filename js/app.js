/**
 * Created by vadym on 23.09.15.
 */
var products = [];
var productsListUl = $(".productsList");
var productsInput = $(".productsInput");

function add(product, index, array){
    var li = $('<li>' + product +'<button class="deleteBtn">Delete</button><input type="text" class="editInput"><button class="editBtn">Edit</button><button class="cancelBtn">Cancel</button><button class="okayBtn">Okay</button></li>');

    productsListUl.append(li);

    li.find('.deleteBtn').on('click', function(){
        array.splice(index,1);
        refresh(array)
    });

    li.find(".editBtn").on("click", function(){
        li.find(".editBtn").hide();
        li.find(".editInput").show();
        li.find(".cancelBtn").show();
        li.find(".okayBtn").show();
    });

    li.find(".cancelBtn").on("click", function(){
        var input = li.find(".editInput");
        input.val("");
        input.hide();
        li.find(".cancelBtn").hide();
        li.find(".okayBtn").hide();
        li.find(".editBtn").show();
    });

    li.find(".okayBtn").on("click", function(){
        var input = li.find(".editInput");
        array[index] = input.val();
        refresh(array)
    });
}

function refresh(array){
    productsInput.val("");
    productsListUl.html('');
    array.forEach(function(product, index){
        add(product, index, array);
    })
}

function addProduct(array){
    var product = productsInput.val();
    array.push(product);
    refresh(array)
}

$('.addProduct').on('click',function(){
    addProduct(products)
});

$(".random").on("click",function(){
    $.get('http://localhost:3000/list', function(data){
        products = data;
        refresh(products);
    })
});