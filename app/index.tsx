import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { useGetUserProfileQuery } from "../store/api/apiSlice";
import {
  selectIsAuthenticated,
  selectIsInitializing,
  selectToken,
} from "../store/slices/authSlice";

export default function Index() {
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);

  const { isLoading: isProfileLoading } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });

  if (isInitializing) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/onboarding"} />;
}
