<template>
    <div class="clock">
        {{ clock }}
    </div>
</template>

<script>
import moment from 'moment';

export default {
    data() {
        return {
            clock: moment().format(" h:mm:ss"),
        };
    },
    methods: {
        moment(args) {
            return moment(args);
        },
        setTime() {
            this.clock = moment().format("h:mm:ss");
        },
    },
    mounted() {
        this.ticker = setInterval(() => {
            this.setTime();
        }, 1000)
    },
    beforeDestroy() {
        clearInterval(this.ticker);
    },
}
</script>

<style>
.clock {
    font-size: 2.5em;
}
</style>
