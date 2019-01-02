document.addEventListener('DOMContentLoaded', function() {
    $('#select-parcelshop').selectize({
      valueField: 'parcelShopId',
      //labelField: 'parcelShopId',
      searchField: 'parcelShopId',
      options: [],
      //create: false,
      loadThrottle: 1000,
      maxItems: 1,
      render: {
        option: function(item, escape) {
          return '<div class="moneymaker-dpd-item">' +
            '<span class="street">' + escape(item.street) + '</span> ' +
            '<span class="houseno">' + escape(item.houseNo) + '</span>, ' +
            '<span class="zip">' + escape(item.zipCode) + '</span> ' +
            '<span class="city">' + escape(item.city) + '</span>' +
          '</div>';
        }
      },
      // TODO: make lowest distance best score
      score: function(search) {
      	var score = this.getScoreFunction(search);
        return function(item) {
            //return score(item) * (1 + Math.min(item.distance  / 100, 1));
          return parseInt(item.distance);
        };
      },
      // TODO: address naar veld in object parsen zodat het gebruikt kan worden als label
      load: function(addressquery, callback) {
        if (!addressquery.length) return callback();
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
            callback(Object.values(res.shops));
          }
        });
      }
    });
  }, false);
