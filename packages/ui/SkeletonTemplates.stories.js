"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineTrackingSkeletonStory = exports.TrackingSkeletonStory = exports.CheckoutSkeletonStory = exports.MenuListSkeletonStory = exports.FiveItems = exports.ThreeItems = exports.TwoItems = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SkeletonTemplates_1 = require("./SkeletonTemplates");
const meta = {
    title: 'Skeletons/ProductListSkeleton',
    component: SkeletonTemplates_1.ProductListSkeleton,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
};
exports.default = meta;
exports.TwoItems = { args: { count: 2 } };
exports.ThreeItems = { args: { count: 3 } };
exports.FiveItems = { args: { count: 5 } };
exports.MenuListSkeletonStory = {
    render: () => (0, jsx_runtime_1.jsx)(SkeletonTemplates_1.MenuListSkeleton, { count: 4 }),
    parameters: { title: 'Skeletons/MenuListSkeleton' },
};
exports.CheckoutSkeletonStory = {
    render: () => (0, jsx_runtime_1.jsx)(SkeletonTemplates_1.CheckoutSkeleton, { itemCount: 3 }),
    parameters: { title: 'Skeletons/CheckoutSkeleton' },
};
exports.TrackingSkeletonStory = {
    render: () => (0, jsx_runtime_1.jsx)(SkeletonTemplates_1.TrackingSkeleton, { stages: 4 }),
    parameters: { title: 'Skeletons/TrackingSkeleton' },
};
exports.TimelineTrackingSkeletonStory = {
    render: () => (0, jsx_runtime_1.jsx)(SkeletonTemplates_1.TimelineTrackingSkeleton, { stages: 5 }),
    parameters: { title: 'Skeletons/TimelineTrackingSkeleton' },
};
