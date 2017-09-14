<template>
  <div class="helper">
    <transition name="fade-and-scale">
      <img v-if="show" src="../assets/helper.png" alt="">
    </transition>
    <transition name="fade-in-delay">
      <div v-if="show" class="popup">
        It looks like the <b>{{event}}</b> meeting is starting soon in <b>{{room}}</b>.
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: [
    'event',
    'room',
  ],
  data() {
    return {
      show: false,
    };
  },
  mounted() {
    setTimeout(() => {
      this.show = true;
    }, 1000)
  }
}
</script>

<style>
.helper {
  position: fixed;
  bottom: 50px;
  left: 50px;
  z-index: 5000;
}
.helper img {
  height: 150px;
  filter: drop-shadow(12px 12px 8px rgba(0,0,0,0.9))
}
.popup {
  position: absolute;
  left: 130%;
  top: 20%;
  background-color: #fffdcd;
  color: black;
  border: 1px solid black;
  border-radius: 8px;
  box-sizing: border-box;
  min-width: 150px;
  padding: 0.5em;
  filter: drop-shadow(6px 6px 8px rgba(0,0,0,0.9))
}
.popup:after, .popup:before {
	right: 100%;
	top: 50%;
	border: solid transparent;
	content: " ";
	height: 0;
	width: 0;
	position: absolute;
	pointer-events: none;
}
.popup:after {
	border-color: rgba(136, 183, 213, 0);
	border-right-color: #fffdcd;
	border-width: 12px;
	margin-top: -12px;
}
.popup:before {
	border-color: rgba(194, 225, 245, 0);
	border-right-color: #fffdcd;
  border-width: 12px;
  margin-top: -12px;
}

.fade-and-scale-enter-active {
  animation: fade-and-scale 1s;
}
.fade-and-scale-leave-active {
  animation: fade-and-scale 1s reverse;
}
@keyframes fade-and-scale {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-in-delay-enter-active {
  animation: fade-in-delay 2s;
}
.fade-in-delay-leave-active {
  animation: fade-in-delay 2s reverse;
}
@keyframes fade-in-delay {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}



</style>
