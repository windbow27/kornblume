<script setup lang="ts">

</script>

<template>
    <dialog id="tutorial" class="modal">
        <div class="modal-box custom-gradient-gray-blue custom-border relative h-2/3">
            <div class="absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue rounded-2xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2.5 top-4 text-white">✕</button>
                </form>
                <h3 class="font-bold text-lg text-info p-2">{{ $t('tutorial') }}</h3>
            </div>

            <div class="text-white overflow-y-auto h-full pt-10">
                <p class="py-4 text-white">{{ $t('video-demonstration-tutorial') }} <a href="https://youtu.be/CNsZ4rGWtyY"
                        target="_blank" class="text-blue-500 hover:text-blue-700">{{
                            $t('summon-tracker-demo') }}</a></p>
                <p class=" text-white">1. {{ $t('take-screenshots-of-your-summon-history') }}</p>
                <p class=" text-white">2.
                    <i18n-t keypath="upload-the-screenshots-to-the-summon-tracker-you-could-upload-multiple-images-at-once">
                        <template #highlight>
                            <span class="text-error">{{ $t('multiple-images') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class=" text-white">3. {{
                    $t('the-summon-tracker-will-automatically-extract-display-and-save-the-information-from-the-screenshots')
                }}</p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('tips') }}</h3>
                <p class=" text-white">1. {{ $t('it-is-advised-to-save-your-screenshots-for-future-usages') }}</p>
                <p class=" text-white">2. {{ $t('after-your-first-import') }}</p>
                <p class=" text-white">3. {{ $t('example-of-incomplete-10x') }}
                    <a href="https://imgur.com/a/6kXTVZz" target="_blank" class="text-blue-500 hover:text-blue-700">{{
                        $t('incomplete-10x') }}</a>
                </p>
                <p class="text-white">4. {{ $t('try-legacy') }}</p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('limitations') }}</h3>
                <p class="text-white">•
                    <i18n-t
                        keypath="ocr-import-only-works-with-english-text-consider-changing-your-language-into-english-to-screenshot">
                        <template #highlight>
                            <span class="text-error">{{ $t('english-text') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class="text-white">•
                    <i18n-t keypath="images-must-be-clear-or-the-summon-tracker-may-fail-to-read">
                        <template #highlight>
                            <span class="text-error">{{ $t('must-be-clear') }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p class="text-white">•
                    <i18n-t
                        keypath='if-images-take-too-long-to-process-or-fail-to-read-5-arcanists-consider-screenshotting-clearer-images'>
                        <template #highlight1>
                            <span class="text-error">{{ $t('take-too-long') }}</span>
                        </template>
                        <template #highlight2>
                            <span class="text-error">{{ $t('fail-to-read') }}</span>
                        </template>
                        <template #star>
                            <i class="fa-solid fa-star text-yellow-100"></i>
                        </template>
                    </i18n-t>
                </p>
                <p class="text-white">•
                    <i18n-t keypath='this-is-an-example-of-a-good-image'>
                        <template #highlight>
                            <a href="https://i.imgur.com/NgspD1g.webp" target="_blank"
                                class="text-blue-500 hover:text-blue-700">{{ $t('image') }}</a>
                        </template>
                    </i18n-t>
                </p>
                <h3 class="font-bold text-lg pt-4 text-info">{{ $t('bug-reports') }}</h3>
                <p class=" text-white">
                    <i18n-t keypath='if-you-encounter-a-bug-pinpoint-its-location-by-using-missing-information-timestamps'>
                        <template #missing>
                            <span class="text-error">{{ $t('missing-information') }}</span>
                        </template>
                    </i18n-t>
                    <span class=" text-white ml-1">{{ $t('import-the-error-images-again') }}</span>
                </p>
                <p class="text-white">{{ $t('if-that-doesnt-work-recapture-the-images-and-import-them-again') }}</p>
                <p class="text-white">
                    <i18n-t
                        keypath='if-the-error-persists-open-your-f12-console-send-the-text-and-images-through-bug-reports-or-directly-to-discord'>
                        <template #discord>@windbow</template>
                    </i18n-t>
                </p>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<style scoped></style>
