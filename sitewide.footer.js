const langFiles = {};

for (const key of ["nl", "de", "en", "fr"]) {
  langFiles[key] = "https://cdn.jsdelivr.net/gh/onsgeld/moneymaker@" + MM_I18N_RELEASE_TAG + "/" + key + ".json";
}

function prepareMetaI18n() {
  var page_path = window.location.pathname.substring(1);
  if (page_path == '') page_path = 'home';
  $("head title").attr("data-i18n", "meta.page-" + page_path + ".title");
  $("head meta[property='og:title']").attr("data-i18n-content", "meta.page-" + page_path + ".title");
  $("head meta[name='description']").attr("data-i18n-content", "meta.page-" + page_path + ".description");
  $("head meta[property='og:description']").attr("data-i18n-content", "meta.page-" + page_path + ".description");
}

function parseI18n(callback) {
  query_lang = getUrlParameter('lang');
  if (query_lang) {
    $.i18n().locale = query_lang;
  }
  else {
    $.getJSON('https://api.ipdata.co/', function(ipdata){
      if (ipdata.languages && ipdata.languages.length > 0) {
        $.i18n().locale = ISO6391.getCode(ipdata.languages[0].name);
      }
      else {
        $.i18n().locale = navigator.language;
      }
    });
  }
  callback.call();
};

function doI18n() {
  updateLangSelector();
  $(".buy-button").attr("data-i18n", "buy_button");
  $("*[data-i18n]").each(function(){
    var $this = $(this);
    var key = $this.attr('data-i18n');
    var args = [key];
    if ($this.data('args'))
      args = args.concat($this.data('args').split(','));
    $this.html( $.i18n.apply(null, args) );
  });
  /*$("*[data-i18n-]").each(function(){
    var node = $(this);
    $.each(this.attributes, function() {
      // this.attributes is not a plain object, but an array
      // of attribute nodes, which contain both the name and value
      if(this.specified) {
        console.log(this.name, this.value);
      }
    });
  });*/
}

function updateLangSelector() {
  var charcode2 = $.i18n().locale.split('-')[0].toLowerCase();
  $('#lang-selector').val(charcode2);
  if (charcode2 == 'en') {
    charcode2 = 'gb'; // or us
  }
  $('#lang-icon').attr('src', 'https://ipdata.co/flags/' + charcode2 + '.png');
}

function getGHLatestReleaseTag(callback) {
  $.getJSON('https://api.github.com/repos/onsgeld/moneymaker/releases/latest', function(release){
    callback.call(release.name)
  });
}

// https://davidwalsh.name/query-string-javascript
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// https://gist.github.com/excalq/2961415#gistcomment-2221360
function setURLParameter(key, value) {
  const params = new URLSearchParams(location.search);
  params.set(key, value);
  window.history.replaceState({}, '', `${location.pathname}?${params}`);
}

jQuery(function($) {
  $.i18n.debug = true;
  $.i18n().load(langFiles).done(function() {
    parseI18n(function(){
      prepareMetaI18n();
      doI18n();
      initShopify();
    });
  });
  $('#lang-selector').change(function(){
    $.i18n().locale = $(this).val();
    doI18n();
    setURLParameter('lang', $.i18n().locale);
  });
});

// https://github.com/wikimedia/jquery.i18n#extending-the-parser
$.extend( $.i18n.parser.emitter, {

  onsgeld: function () {
    return 'Stichting Ons Geld';
  },

  firebrush: function () {
    return 'Firebrush Studio\'s';
  },

  immr: function () {
    return 'International Movement for Monetary Reform';
  },

  // Handle LINK keywords
  link: function ( nodes ) {
    return '<a href="' + nodes[1] + '">' + nodes[0] + '</a>';
  }
});

function initShopify() {
  (function () {
    var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    if (window.ShopifyBuy) {
      if (window.ShopifyBuy.UI) {
        ShopifyBuyInit();
      } else {
        loadScript();
      }
    } else {
      loadScript();
    }

    function loadScript() {
      var script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      script.onload = ShopifyBuyInit;
    }

    function ShopifyBuyInit() {
      var client = ShopifyBuy.buildClient({
        domain: 'money-maker-cooperative.myshopify.com',
        storefrontAccessToken: '2372271a10d3c068effa7c71ff07524b',
        appId: '6',
      });

      ShopifyBuy.UI.onReady(client).then(function (ui) {
        jQuery('.shopify-button').each(function(){
          var button = jQuery(this);
          ui.createComponent('product', {
            id: [1356474450038],
            node: this,
            moneyFormat: '%E2%82%AC%7B%7Bamount_with_comma_separator%7D%7D',
            options: {
              "product": {
                "buttonDestination": "modal",
                "layout": "vertical",
                "width": "100%",
                "variantId": "all",
                "classes": {"button": button.attr('data-shopify-classes')},
                "iframe": false,
                "contents": {
                  "img": false,
                  "imgWithCarousel": false,
                  "description": false,
                  "buttonWithQuantity": false,
                  "quantity": false,
                  "price": false,
                  "title": false,
                  "options": false,
                },
                "text": {
                  "button": $.i18n('buy_button')
                },
                "styles": {
                  "product": {
                    "text-align": "left",
                    "margin-top": "0",
                    "margin-bottom": "0",
                    "button": {
                      "background-color": "#aa332f",
                      "margin-top": "0",
                    },
                  },
                  "title": {
                    "font-size": "26px"
                  },
                  "price": {
                    "font-size": "18px"
                  },
                  "compareAt": {
                    "font-size": "15px"
                  }
                }
              },
              "cart": {
                "contents": {
                  "button": true
                },
                "styles": {
                  "footer": {
                    "background-color": "#ffffff"
                  }
                }
              },
              "modalProduct": {
                "contents": {
                  "img": false,
                  "imgWithCarousel": true,
                  "variantTitle": false,
                  "buttonWithQuantity": true,
                  "button": false,
                  "quantity": false
                },
                "styles": {
                  "product": {
                    "@media (min-width: 601px)": {
                      "max-width": "100%",
                      "margin-left": "0px",
                      "margin-bottom": "0px"
                    }
                  }
                }
              },
              "productSet": {
                "styles": {
                  "products": {
                    "@media (min-width: 601px)": {
                      "margin-left": "-20px"
                    }
                  }
                }
              }
            }
          });
        });
      });
    }
  })();
}
