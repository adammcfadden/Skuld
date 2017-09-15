<template>
    <div class="timeline">
        <p>8:00</p>
        <p>-</p>
        <p>9:00</p>
        <p>-</p>        
        <p>10:00</p>
        <p>-</p>        
        <p>11:00</p>
        <p>-</p>        
        <p>12:00</p>
        <p>-</p>        
        <p>1:00</p>
        <p>-</p>        
        <p>2:00</p>
        <p>-</p>        
        <p>3:00</p>
        <p>-</p>        
        <p>4:00</p>
        <p>-</p>        
        <p>5:00</p>
        <p>-</p>        
        <p>6:00</p>
    </div>
</template>

<script>
export default {

};
</script>

<style>
.timeline {
    position: absolute;
    top: 0;
    left: -48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    line-height: 1;
    width: 56px;
    align-items: center
}
.timeline p {
    margin: 0;
    /* width: 48px */
}
</style>
