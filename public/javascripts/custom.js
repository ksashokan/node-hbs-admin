// const { response } = require("../../app");

$('#hideSub').hide();
$("#category").on('change', function() {
    var categoryId = $(this).val();

    $.ajax({
        url : '/admin/sub-category-details',
        method : 'post',
        dataType : 'json',
        data : {
            categoryId : categoryId
        },
        success : (response) => {
            $('#hideSub').show();
            console.log(response.dataList);
            $("#subcategoryDropDown").html('<option selected disabled value="">Select Sub Category</option>')
            $.each(response.dataList, (key, value) => {
                $("#subcategoryDropDown").append('<option value="' + value._id + '">' + value.sub_category + '</option>');
            })
        }
    })
})
