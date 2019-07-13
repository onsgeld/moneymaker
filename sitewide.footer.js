const langFiles = {};

// TODO: replace with https://github.com/markdown-it/markdown-it
// and merge multiple text boxes with single markdown <p>
// const mdparser = new showdown.Converter({
//   simplifiedAutoLink: true,
//   simpleLineBreaks: true,
//   openLinksInNewWindow: true
// });

const mdparser = window.markdownit();

for (const key of MM_I18N_LANGUAGES) {
  langFiles[key] = "https://cdn.jsdelivr.net/gh/onsgeld/moneymaker@" + MM_I18N_RELEASE_TAG + "/" + key + ".json";
}

// since Webflow doesnt provide internationalised meta tags yet,
// we have to prepare them with translation tags
function prepareMetaI18n() {
  var page_path = window.location.pathname.substring(1) || 'home';
  var title_path = "meta.page-" + page_path + ".title";
  var description_path = "meta.page-" + page_path + ".description";
  
  prepareMetaTags({
    "head title":                           title_path,
    "head meta[property='og:title']":       title_path,
    "head meta[name='description']":        description_path,
    "head meta[property='og:description']": description_path
  })
}

function prepareMetaTag(metaSelector, i18nKey) {
  $(metaSelector).attr({
    "data-i18n": i18nKey
  });
}

function prepareMetaTags(map) {
  Object.keys(map).forEach(function(key,index) {
    prepareMetaTag(key, map[key])
  });
}

// determine the i18n lang from the context
function parseI18n(callback) {
  query_lang = getUrlParameter('lang');
  if (query_lang) {
    $.i18n().locale = query_lang;
    callback.call();
  }
  else {
    $.getJSON('https://api.ipdata.co/?api-key=' + MM_IPDATA_API_KEY, function(ipdata){
      if (ipdata.languages && ipdata.languages.length > 0) {
        $.i18n().locale = ISO6391.getCode(ipdata.languages[0].name);
      }
      else {
        $.i18n().locale = navigator.language;
      }
      callback.call();
    });
  }
};

function getLocale2() {
  return $.i18n().locale.split('-')[0].toLowerCase();
}

// perform translation on all tagged nodes using the set locale
function doI18n() {
  updateLangSelector();
  parseI18nTags();
  setURLParameter('lang', getLocale2());
}

// go over all tagged nodes and parse translation
function parseI18nTags() {
  $(".buy-button").attr("data-i18n", "buy_button");
  $("*[data-i18n]").each(function(){
    var $this = $(this);
    var key = $this.attr('data-i18n');
    var args = []
    if ($this.data('args')) {
      args = $this.data('args').split(',');
    }
    translateTag(this, key, $this.attr('data-i18n-target'), args);
  });
}

function isStringI18nKey(string) {
  return /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(string)
}

// translate a single node
function translateTag(nodeSelector, i18nKey, targetAttr, args) {
  var translated = $.i18n.apply(null, [i18nKey].concat(args || []));
  if (translated !== i18nKey) {
    var node = $(nodeSelector);
    if (node.prop("tagName") == "META" && !targetAttr) {
      targetAttr = 'content';
    }
    if (!targetAttr || targetAttr == 'html') {
      node.html(mdparser.renderInline(translated));
    }
    else {
      node.attr(targetAttr, translated);
    }
  }
  else {
    console.warn("content for key " + i18nKey + " was not translated");
  }
}

function getI18nProductId() {
  return MM_SHOP_I18N_PRODUCT_MAP[$.i18n().locale] || MM_SHOP_I18N_PRODUCT_MAP['en'];
}

// reflect a newly set locale in the language dropdown
function updateLangSelector() {
  var charcode2 = getLocale2();
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

// reflect configured lang in DOM UI
function updateUI() {
  doI18n();
  initShopify();
}

jQuery(function($) {
  $.i18n.debug = true;
  $.i18n().load(langFiles).done(function() {
    parseI18n(function(){
      prepareMetaI18n();
      updateUI();
    });
  });
  $('#lang-selector').change(function(){
    $.i18n().locale = $(this).val();
    updateUI()
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
        domain: MM_SHOP_DOMAIN,
        storefrontAccessToken: MM_SHOP_CLIENT_TOKEN,
        appId: '6',
      });

      ShopifyBuy.UI.onReady(client).then(function (ui) {
        jQuery('.shopify-buy__product').remove();
        jQuery('.shopify-button').each(function(){
          var button = jQuery(this);
          ui.createComponent('product', {
            id: [getI18nProductId()],
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
                },

                // https://ecommerce.shopify.com/c/ecommerce-design/t/cart-widget-with-buy-button-go-to-full-checkout-and-not-popup-331134
                "popup": false,

                // doesnt seem to work
                /*events: {
                  openCheckout: function (cart) {
                    window.location.href = "http://shop.moneymaker.games/cart";
                  }
                },*/

                // only fires after loading original popup
                "DOMEvents": {
                  'click button.shopify-buy__btn--cart-checkout': function (evt, target) {
                    window.location.href = "http://shop.moneymaker.games/cart";
                  }
                },

                "templates": {
                  footer: `{{^data.isEmpty}}
                    <div class="{{data.classes.cart.footer}}" data-element="cart.footer">
                      <p class="{{data.classes.cart.subtotalText}}" data-element="cart.total">{{data.text.total}}</p>
                      <p class="{{data.classes.cart.subtotal}}" data-element="cart.subtotal">{{data.formattedTotal}}</p>
                      <p class="{{data.classes.cart.notice}}" data-element="cart.notice">{{data.text.notice}}</p>
                      <button class="{{data.classes.cart.button}}" type="button" data-element="cart.button">{{data.text.button}}</button>
                    </div>
                   {{/data.isEmpty}}`
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
