import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Category, Template } from "../../constants/Templates";
import { auth } from "../../lib/firebase";
import { logout, Plan, setToken, User } from "../slices/authSlice";

export interface GalleryItem {
  _id: string;
  templateId: any;
  userId: string;
  prompt: string;
  inputImages: string[];
  progress: number;
  uuid: string;
  url: string | null;
  gifUrl: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateVideoRequest {
  templateId?: string;
  useOnlyPrompt: boolean;
  prompt: string;
  files?: any[];
}

export interface Transaction {
  _id: string;
  planId: string;
  userId: string;
  transactionId: string;
  amount: number;
  credits: number;
  paymentId?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
export const API_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/`;
export const FILE_BASE_URL = `${process.env.EXPO_PUBLIC_BASE_URL}/`;

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const user = auth.currentUser;
    if (user) {
      try {
        const freshToken = await user.getIdToken(true);
        if (freshToken) {
          api.dispatch(setToken(freshToken));
          result = await baseQuery(args, api, extraOptions);
        }
      } catch (err) {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Project", "Featured", "Category", "Template"],
  endpoints: (builder) => ({
    registerUser: builder.mutation<User, { token?: string } | void>({
      query: (arg) => ({
        url: "users/auth/register",
        method: "POST",
        body: {},
        headers:
          arg && "token" in arg
            ? {
                authorization: `Bearer ${arg.token}`,
              }
            : undefined,
      }),
      transformResponse: (response: any) => {
        const user = response?.data;
        if (!user) return null as any;
        return {
          id: user._id,
          name: user.name || "",
          email: user.email || "",
          profilePicture: user.profilePicture,
          credits: user.credits || 0,
          authId: user.authId || "",
        };
      },
      invalidatesTags: ["User"],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const { updateUser } = await import("../slices/authSlice");
          dispatch(updateUser(data));
        } catch (error) {}
      },
    }),
    getUserProfile: builder.query<User, void>({
      query: () => "users/auth/get-user",
      transformResponse: (response: any) => {
        const user = response?.data;
        if (!user) return null as any;
        return {
          id: user._id,
          name: user.name || "",
          email: user.email || "",
          profilePicture: user.profilePicture,
          credits: user.credits || 0,
          authId: user.authId || "",
        };
      },
      providesTags: ["User"],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            const { updateUser } = await import("../slices/authSlice");
            dispatch(updateUser(data));
          }
        } catch (error) {}
      },
    }),
    getTemplatesByCategory: builder.query<Category[], void>({
      query: () => "users/templates",
      transformResponse: (response: any) => {
        if (!response.success) return [];
        return response.data.map((cat: any) => ({
          id: cat._id,
          title: cat.name,
          templates: cat.templates.map((t: any) => ({
            id: t._id,
            title: t.name,
            description: t.description,
            image: t.image.startsWith("http")
              ? t.image
              : `${FILE_BASE_URL}${t.image}`,
            inputType: t.inputType,
            inputCount: t.noOfInput,
            prompt: t.prompt || "",
          })),
        }));
      },
      providesTags: ["Template"],
    }),
    getTopTemplates: builder.query<Template[], { limit?: number } | void>({
      query: (arg) => ({
        url: "users/templates/top-templates",
        params: arg && typeof arg === "object" ? arg : undefined,
      }),
      transformResponse: (response: any) => {
        if (!response.success) return [];
        return response.data.map((t: any) => ({
          id: t._id,
          title: t.name,
          description: t.description,
          image: t.image.startsWith("http")
            ? t.image
            : `${FILE_BASE_URL}${t.image}`,
          inputType: t.inputType,
          inputCount: t.noOfInput,
          prompt: t.prompt || "",
        }));
      },
      providesTags: ["Template"],
    }),

    generateVideo: builder.mutation<
      any,
      { body: FormData; params?: { isAiVideoTab: string } }
    >({
      query: ({ body, params }) => ({
        url: "users/videos/generate",
        method: "POST",
        body,
        params,
      }),
      transformResponse: (response: any) => {
        console.log(
          "Generate Video Response:",
          JSON.stringify(response, null, 2)
        );
        return response;
      },
      invalidatesTags: ["Project", "User"],
    }),
    getVideoStatus: builder.query<GalleryItem, string>({
      query: (uuid) => `users/videos/status/${uuid}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, uuid) => [{ type: "Project", id: uuid }],
      async onQueryStarted(uuid, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedVideo } = await queryFulfilled;
          if (updatedVideo) {
            dispatch(
              apiSlice.util.updateQueryData(
                "getGallery" as any,
                undefined,
                (draft: any) => {
                  const projectIndex = draft.findIndex(
                    (p: GalleryItem) =>
                      p.uuid === uuid || p._id === updatedVideo._id
                  );
                  if (projectIndex !== -1) {
                    draft[projectIndex] = {
                      ...draft[projectIndex],
                      ...updatedVideo,
                    };
                  }
                }
              )
            );
          }
        } catch (error: any) {
          if (error?.error?.status !== 401) {
            console.error("Error updating gallery cache from status:", error);
          }
        }
      },
    }),
    getGallery: builder.query<
      GalleryItem[],
      { page?: number; limit?: number } | void
    >({
      query: (arg) => ({
        url: "users/videos/gallery",
        params: arg || undefined,
      }),
      transformResponse: (response: any) => {
        if (!response.success) return [];
        return response.data.data;
      },
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg && (arg as any).page === 1) {
          return newItems;
        }
        return [...currentCache, ...newItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ uuid }) => ({
                type: "Project" as const,
                id: uuid,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }],
    }),
    getPlans: builder.query<Plan[], void>({
      query: () => "users/plans",
      transformResponse: (response: any) => {
        if (!response.success) return [];
        return response.data.map((p: any) => ({
          id: p._id,
          name: p.name,
          bulletPoints: p.bulletPoints,
          credits: p.credits,
          amount: p.amount,
          mostPopular: p.mostPopular,
          bestValue: p.bestValue,
          playStorePlanId: p.playStorePlanId,
        }));
      },
    }),
    getPurchaseHistory: builder.query<Transaction[], void>({
      query: () => "users/payments/transactions",
      transformResponse: (response: any) => {
        if (!response.success) return [];
        return response.data;
      },
    }),
    verifyPurchase: builder.mutation<any, { planId: string; transaction: any }>(
      {
        query: (body) => ({
          url: "users/payments/verify-in-app-purchase",
          method: "POST",
          body,
        }),
        invalidatesTags: ["User"],
      }
    ),
    reportVideo: builder.mutation<void, { videoId: string; reason: string }>({
      query: (body) => ({
        url: "users/reports",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetUserProfileQuery,
  useGetTemplatesByCategoryQuery,
  useGetTopTemplatesQuery,
  useGetPlansQuery,
  useGenerateVideoMutation,
  useGetVideoStatusQuery,
  useGetGalleryQuery,
  useGetPurchaseHistoryQuery,
  useVerifyPurchaseMutation,
  useReportVideoMutation,
} = apiSlice;
