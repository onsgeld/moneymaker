document.addEventListener('DOMContentLoaded', function() {
    $selectDpd = $('#select-parcelshop').selectize({
      valueField: 'parcelShopId',
      labelField: 'address',
      searchField: 'parcelShopId',
      sortField: 'distance',
      optgroupField: 'city',
      options: [],
      //create: false,
      loadThrottle: 1000,
      maxItems: 1,
      render: {
        // see selectize.js-master/examples/optgroups.html
//         optgroup_header: function(data, escape) {
//             return '<div class="optgroup-header">' + 
//                 escape(data.label) + 
//                 //' <span class="scientific">' + escape(data.label_scientific) + '</span>' +
//             '</div>';
//         },
        option: function(item, escape) {
          return '<div class="moneymaker-dpd-item">' + 
            '<span class="street dpd-field dpd-address-field">' + escape(item.street) + '</span> ' +
            '<span class="houseno dpd-field dpd-address-field">' + escape(item.houseNo) + '</span>' + 
            '<span class="zip dpd-field dpd-address-field">' + escape(item.zipCode) + '</span>'
          '</div>';
        }
      },
      load: function(addressquery, callback) {
        if (!addressquery.length) return callback();
        var that = this;
        $.ajax({
          url: 'https://dpd.moneymaker.games/',
          type: 'GET',
          dataType: 'json',
          crossDomain : true,
          data: {
            address: addressquery,
          },
          error: function() {
            callback();
          },
          success: function(res) {
            var shops = Object.values(res.shops).map(function(shop) {
              shop.address = shop.street + " " + shop.houseNo + ", " + shop.zipCode + " " + shop.city;
              return shop;
            });
            $.each(shops, function(index, value) {
              that.addOptionGroup(value.city, {value: value.city, label: value.city, text: value.city});
            });
            that.refreshOptions();
            callback(shops);
          }
        });
      }
    });
  }, false);
