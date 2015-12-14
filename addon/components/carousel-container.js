import Ember from 'ember';
import layout from '../templates/components/carousel-container';

const { computed, on, run } = Ember;

function setDefaultActiveObject() {
  if (!this.isDestroyed && !this.isDestroying && this.get('carouselItems.length')){
    const carouselItems = this.get('carouselItems');
    carouselItems.forEach((item, index) => {
      item.set('index', index);
    });
    const firstItem = carouselItems.get('firstObject');
    firstItem.set('isActive', true);
  }
}

export default Ember.Component.extend({
  layout: layout,
  classNames: ['carousel-container'],
  'transition-interval': 500,

  isCarouselParentContainer: true,

  carouselItems: null,
  totalCarouselItems: computed.reads('carouselItems.length'),

  initializeCarouselItems: on('init', function() {
    this.set('carouselItems', Ember.A());
  }),

  activeCarouselItem: computed('carouselItems.[]', 'carouselItems.@each.isActive', function() {
    return this.get('carouselItems').findBy('isActive');
  }),

  registerCarouselItem(carouselItem) {
    this.get('carouselItems').pushObject(carouselItem);
  },

  slide(newActiveIndex, direction) {
    var carouselItems = this.get('carouselItems');
    var activeCarouselItem = this.get('activeCarouselItem');
    if (!activeCarouselItem || !carouselItems.get('length')) { return; }

    var newActiveCarouselItem = carouselItems[newActiveIndex];
    let transitionInterval = this.get('transition-interval');
    let transitionOffset = 50;

    run(function() {
      activeCarouselItem.set('from', direction);
      newActiveCarouselItem.set('from', direction);
    });

    run.later(function() {
      activeCarouselItem.set('slidingOut', true);
      newActiveCarouselItem.set('slidingIn', true);
    }, transitionOffset);

    run.later(function() {
      activeCarouselItem.setProperties({
        slidingOut: false,
        from: null,
        isActive: false
      });

      newActiveCarouselItem.setProperties({
        slidingIn: false,
        from: null,
        isActive: true
      });
    }, (transitionInterval + transitionOffset));
  },

  slideRight() {
    var activeIndex = this.get('activeCarouselItem.index');
    let newActiveIndex = activeIndex - 1;

    if(activeIndex === 0) {
      newActiveIndex = this.get('totalCarouselItems') - 1;
    }

    this.slide(newActiveIndex, 'right');
  },

  slideLeft() {
    var activeIndex = this.get('activeCarouselItem.index');
    let newActiveIndex = activeIndex + 1;

    if(activeIndex === (this.get('totalCarouselItems') - 1)) {
      newActiveIndex = 0;
    }

    this.slide(newActiveIndex, 'left');
  },

  removeCarouselItem(carouselItem) {
    const isRemovedItemActive = carouselItem.get('isActive');
    this.get('carouselItems').removeObject(carouselItem);
    if (isRemovedItemActive) {
      Ember.run.debounce(this, setDefaultActiveObject, 250);
    }
  }
});
